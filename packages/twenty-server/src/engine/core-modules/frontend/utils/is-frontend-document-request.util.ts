import { extname } from 'path';

import { type Request } from 'express';
import { ApiPath } from 'twenty-shared/types';

export const isFrontendDocumentRequest = (request: Request): boolean => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return false;
  }

  const pathname = request.path;
  const isApiPath = Object.values(ApiPath).some(
    (prefix) => pathname === `/${prefix}` || pathname.startsWith(`/${prefix}/`),
  );

  const isAssetPath = ['assets', 'images', 'icons', 'cf-fonts'].some(
    (prefix) => pathname === `/${prefix}` || pathname.startsWith(`/${prefix}/`),
  );

  return (
    !isApiPath &&
    !isAssetPath &&
    (pathname === '/index.html' || extname(pathname) === '') &&
    request.accepts('html') !== false
  );
};
