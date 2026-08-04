import { ApiPath } from 'twenty-shared/types';

export const API_PROXY_PATHS = Object.values(ApiPath);

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const buildApiProxyMatcher = (apiPath: ApiPath) =>
  `^/${escapeRegExp(apiPath)}($|[/?])`;
