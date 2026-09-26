import { extname } from 'path';

import { type Request } from 'express';
import { isDefined } from 'twenty-shared/utils';
import { ApiPath } from 'twenty-shared/types';

const NAVIGATION_DESTINATIONS = ['document', 'iframe', 'frame'];

export const isFrontendDocumentRequest = (request: Request): boolean => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return false;
  }

  const pathname = request.path;
  const isApiPath = Object.values(ApiPath).some(
    (prefix) => pathname === `/${prefix}` || pathname.startsWith(`/${prefix}/`),
  );

  if (isApiPath || !request.accepts().includes('text/html')) {
    return false;
  }

  const destination = request.get('Sec-Fetch-Dest');

  if (isDefined(destination)) {
    return NAVIGATION_DESTINATIONS.includes(destination);
  }

  // Without fetch metadata (non-browser clients, non-secure origins) we cannot
  // tell a navigation from a missing file, so dotted paths are treated as files
  return pathname === '/index.html' || extname(pathname) === '';
};
