var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { getPrimaryKey, parseFilters, getOrderBy, dataWithId, dataWithoutId, getQuery, getKeyData, encodeId, decodeId, isCompoundKey, } from './urlBuilder';
import qs from 'qs';
export var defaultPrimaryKeys = new Map();
export var defaultSchema = function () { return ''; };
var useCustomSchema = function (schema, metaSchema, method) {
    var _a;
    var funcHeaderSchema = schema;
    if (metaSchema !== undefined) {
        funcHeaderSchema = function () { return metaSchema; };
    }
    if (funcHeaderSchema().length > 0) {
        var schemaHeader = '';
        if (['GET', 'HEAD'].includes(method)) {
            schemaHeader = 'Accept-Profile';
        }
        else if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
            schemaHeader = 'Content-Profile';
        }
        else
            return {};
        return _a = {}, _a[schemaHeader] = funcHeaderSchema(), _a;
    }
    else
        return {};
};
export default (function (config) { return ({
    getList: function (resource, params) {
        var _a, _b;
        if (params === void 0) { params = {}; }
        var primaryKey = getPrimaryKey(resource, config.primaryKeys);
        var _c = params.pagination, page = _c.page, perPage = _c.perPage;
        var _d = params.sort || {}, field = _d.field, order = _d.order;
        var _e = parseFilters(params, config.defaultListOp), filter = _e.filter, select = _e.select;
        var metaSchema = (_a = params.meta) === null || _a === void 0 ? void 0 : _a.schema;
        var query = __assign({ offset: String((page - 1) * perPage), limit: String(perPage) }, filter);
        if (field) {
            query.order = getOrderBy(field, order, primaryKey);
        }
        if (select) {
            query.select = select;
        }
        // add header that Content-Range is in returned header
        var options = {
            headers: new Headers(__assign(__assign({ Accept: 'application/json', Prefer: 'count=exact' }, (((_b = params.meta) === null || _b === void 0 ? void 0 : _b.headers) || {})), useCustomSchema(config.schema, metaSchema, 'GET'))),
        };
        var url = "".concat(config.apiUrl, "/").concat(resource, "?").concat(qs.stringify(query));
        return config.httpClient(url, options).then(function (_a) {
            var headers = _a.headers, json = _a.json;
            if (!headers.has('content-range')) {
                throw new Error("The Content-Range header is missing in the HTTP Response. The postgREST data provider expects \n          responses for lists of resources to contain this header with the total number of results to build \n          the pagination. If you are using CORS, did you declare Content-Range in the Access-Control-Expose-Headers header?");
            }
            return {
                data: json.map(function (obj) { return dataWithId(obj, primaryKey); }),
                total: parseInt(headers.get('content-range').split('/').pop(), 10),
            };
        });
    },
    getOne: function (resource, params) {
        var _a, _b;
        if (params === void 0) { params = {}; }
        var id = params.id, meta = params.meta;
        var primaryKey = getPrimaryKey(resource, config.primaryKeys);
        var query = getQuery(primaryKey, id, resource, meta);
        var url = "".concat(config.apiUrl, "/").concat(resource, "?").concat(qs.stringify(query));
        var metaSchema = (_a = params.meta) === null || _a === void 0 ? void 0 : _a.schema;
        return config
            .httpClient(url, {
            headers: new Headers(__assign(__assign({ accept: 'application/vnd.pgrst.object+json' }, (((_b = params.meta) === null || _b === void 0 ? void 0 : _b.headers) || {})), useCustomSchema(config.schema, metaSchema, 'GET'))),
        })
            .then(function (_a) {
            var json = _a.json;
            return ({
                data: dataWithId(json, primaryKey),
            });
        });
    },
    getMany: function (resource, params) {
        var _a;
        if (params === void 0) { params = {}; }
        var ids = params.ids;
        var primaryKey = getPrimaryKey(resource, config.primaryKeys);
        var query = getQuery(primaryKey, ids, resource, params.meta);
        var url = "".concat(config.apiUrl, "/").concat(resource, "?").concat(qs.stringify(query));
        var metaSchema = (_a = params.meta) === null || _a === void 0 ? void 0 : _a.schema;
        return config
            .httpClient(url, {
            headers: new Headers(__assign({}, useCustomSchema(config.schema, metaSchema, 'GET'))),
        })
            .then(function (_a) {
            var json = _a.json;
            return ({
                data: json.map(function (data) { return dataWithId(data, primaryKey); }),
            });
        });
    },
    getManyReference: function (resource, params) {
        var _a;
        var _b, _c;
        if (params === void 0) { params = {}; }
        var _d = params.pagination, page = _d.page, perPage = _d.perPage;
        var _e = params.sort, field = _e.field, order = _e.order;
        var _f = parseFilters(params, config.defaultListOp), filter = _f.filter, select = _f.select;
        var primaryKey = getPrimaryKey(resource, config.primaryKeys);
        var metaSchema = (_b = params.meta) === null || _b === void 0 ? void 0 : _b.schema;
        var query = params.target
            ? __assign((_a = {}, _a[params.target] = "eq.".concat(params.id), _a.order = getOrderBy(field, order, primaryKey), _a.offset = String((page - 1) * perPage), _a.limit = String(perPage), _a), filter) : __assign({ order: getOrderBy(field, order, primaryKey), offset: String((page - 1) * perPage), limit: String(perPage) }, filter);
        if (select) {
            query.select = select;
        }
        // add header that Content-Range is in returned header
        var options = {
            headers: new Headers(__assign(__assign({ Accept: 'application/json', Prefer: 'count=exact' }, (((_c = params.meta) === null || _c === void 0 ? void 0 : _c.headers) || {})), useCustomSchema(config.schema, metaSchema, 'GET'))),
        };
        var url = "".concat(config.apiUrl, "/").concat(resource, "?").concat(qs.stringify(query));
        return config.httpClient(url, options).then(function (_a) {
            var headers = _a.headers, json = _a.json;
            if (!headers.has('content-range')) {
                throw new Error("The Content-Range header is missing in the HTTP Response. The postgREST data provider expects \n          responses for lists of resources to contain this header with the total number of results to build \n          the pagination. If you are using CORS, did you declare Content-Range in the Access-Control-Expose-Headers header?");
            }
            return {
                data: json.map(function (data) { return dataWithId(data, primaryKey); }),
                total: parseInt(headers.get('content-range').split('/').pop(), 10),
            };
        });
    },
    update: function (resource, params) {
        var _a, _b;
        if (params === void 0) { params = {}; }
        var id = params.id, data = params.data, meta = params.meta;
        var primaryKey = getPrimaryKey(resource, config.primaryKeys);
        var query = getQuery(primaryKey, id, resource, meta);
        var primaryKeyData = getKeyData(primaryKey, data);
        var url = "".concat(config.apiUrl, "/").concat(resource, "?").concat(qs.stringify(query));
        var metaSchema = (_a = params.meta) === null || _a === void 0 ? void 0 : _a.schema;
        var body = JSON.stringify(__assign(__assign({}, dataWithoutId(data, primaryKey)), primaryKeyData));
        return config
            .httpClient(url, {
            method: 'PATCH',
            headers: new Headers(__assign(__assign({ Accept: 'application/vnd.pgrst.object+json', Prefer: 'return=representation', 'Content-Type': 'application/json' }, (((_b = params.meta) === null || _b === void 0 ? void 0 : _b.headers) || {})), useCustomSchema(config.schema, metaSchema, 'PATCH'))),
            body: body,
        })
            .then(function (_a) {
            var json = _a.json;
            return ({ data: dataWithId(json, primaryKey) });
        });
    },
    updateMany: function (resource, params) {
        var _a, _b;
        if (params === void 0) { params = {}; }
        var ids = params.ids;
        var primaryKey = getPrimaryKey(resource, config.primaryKeys);
        var body = JSON.stringify(params.ids.map(function (id) {
            var data = params.data;
            var primaryKeyParams = decodeId(id, primaryKey);
            var primaryKeyData = {};
            if (isCompoundKey(primaryKey)) {
                primaryKey.forEach(function (key, index) {
                    primaryKeyData[key] = primaryKeyParams[index];
                });
            }
            else {
                primaryKeyData[primaryKey[0]] = primaryKeyParams[0];
            }
            return __assign(__assign({}, dataWithoutId(data, primaryKey)), primaryKeyData);
        }));
        var url = "".concat(config.apiUrl, "/").concat(resource);
        var metaSchema = (_a = params.meta) === null || _a === void 0 ? void 0 : _a.schema;
        return config
            .httpClient(url, {
            method: 'PATCH',
            headers: new Headers(__assign(__assign({ Prefer: 'return=representation', 'Content-Type': 'application/json' }, (((_b = params.meta) === null || _b === void 0 ? void 0 : _b.headers) || {})), useCustomSchema(config.schema, metaSchema, 'PATCH'))),
            body: body,
        })
            .then(function (_a) {
            var json = _a.json;
            return ({
                data: json.map(function (data) { return encodeId(data, primaryKey); }),
            });
        });
    },
    create: function (resource, params) {
        var _a, _b;
        if (params === void 0) { params = {}; }
        var meta = params.meta;
        var primaryKey = getPrimaryKey(resource, config.primaryKeys);
        var query = getQuery(primaryKey, undefined, resource, meta);
        var url = "".concat(config.apiUrl, "/").concat(resource, "?").concat(qs.stringify(query));
        var metaSchema = (_a = params.meta) === null || _a === void 0 ? void 0 : _a.schema;
        return config
            .httpClient(url, {
            method: 'POST',
            headers: new Headers(__assign(__assign({ Accept: 'application/vnd.pgrst.object+json', Prefer: 'return=representation', 'Content-Type': 'application/json' }, (((_b = params.meta) === null || _b === void 0 ? void 0 : _b.headers) || {})), useCustomSchema(config.schema, metaSchema, 'POST'))),
            body: JSON.stringify(dataWithoutId(params.data, primaryKey)),
        })
            .then(function (_a) {
            var json = _a.json;
            return ({
                data: __assign(__assign({}, json), { id: encodeId(json, primaryKey) }),
            });
        });
    },
    delete: function (resource, params) {
        var _a, _b;
        if (params === void 0) { params = {}; }
        var id = params.id, meta = params.meta;
        var primaryKey = getPrimaryKey(resource, config.primaryKeys);
        var query = getQuery(primaryKey, id, resource, meta);
        var url = "".concat(config.apiUrl, "/").concat(resource, "?").concat(qs.stringify(query));
        var metaSchema = (_a = params.meta) === null || _a === void 0 ? void 0 : _a.schema;
        return config
            .httpClient(url, {
            method: 'DELETE',
            headers: new Headers(__assign(__assign({ Accept: 'application/vnd.pgrst.object+json', Prefer: 'return=representation', 'Content-Type': 'application/json' }, (((_b = params.meta) === null || _b === void 0 ? void 0 : _b.headers) || {})), useCustomSchema(config.schema, metaSchema, 'DELETE'))),
        })
            .then(function (_a) {
            var json = _a.json;
            return ({ data: dataWithId(json, primaryKey) });
        });
    },
    deleteMany: function (resource, params) {
        var _a, _b;
        if (params === void 0) { params = {}; }
        var ids = params.ids, meta = params.meta;
        var primaryKey = getPrimaryKey(resource, config.primaryKeys);
        var query = getQuery(primaryKey, ids, resource, meta);
        var url = "".concat(config.apiUrl, "/").concat(resource, "?").concat(qs.stringify(query));
        var metaSchema = (_a = params.meta) === null || _a === void 0 ? void 0 : _a.schema;
        return config
            .httpClient(url, {
            method: 'DELETE',
            headers: new Headers(__assign(__assign({ Prefer: 'return=representation', 'Content-Type': 'application/json' }, (((_b = params.meta) === null || _b === void 0 ? void 0 : _b.headers) || {})), useCustomSchema(config.schema, metaSchema, 'DELETE'))),
        })
            .then(function (_a) {
            var json = _a.json;
            return ({
                data: json.map(function (data) { return encodeId(data, primaryKey); }),
            });
        });
    },
}); });