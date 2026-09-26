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

  const destination = request.get('Sec-Fetch-Dest');

  return (
    !isApiPath &&
    request.accepts().includes('text/html') &&
    (!isDefined(destination) || NAVIGATION_DESTINATIONS.includes(destination))
  );
};
