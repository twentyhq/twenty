import { extname } from 'path';

import { type Request } from 'express';
import { isDefined } from 'twenty-shared/utils';
import { ApiPath } from 'twenty-shared/types';

export const isFrontendDocumentRequest = (request: Request): boolean => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return false;
  }

  const pathname = request.path;
  const isApiPath = Object.values(ApiPath).some(
    (prefix) => pathname === `/${prefix}` || pathname.startsWith(`/${prefix}/`),
  );

  const destination = request.get('Sec-Fetch-Dest');

  return (
    !isApiPath &&
    (pathname === '/index.html' || extname(pathname) === '') &&
    request.accepts().includes('text/html') &&
    (!isDefined(destination) ||
      ['document', 'iframe', 'frame'].includes(destination))
  );
};
