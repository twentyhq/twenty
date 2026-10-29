import { ApiPath } from 'twenty-shared/types';

const API_PATH_PREFIXES = Object.values(ApiPath).map(
  (apiPath) => `/${apiPath}`,
);

export const isTwentyServerApiPath = (pathname: string): boolean =>
  API_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
