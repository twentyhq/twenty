import { isNonEmptyString } from '@sniptt/guards';
import { FRONT_COMPONENT_HOST_FETCH_HEADER_NAME } from 'twenty-shared/constants';
import { CustomError, getUrlSafely, isDefined } from 'twenty-shared/utils';

import { resolveHostFetchRedirectMode } from '@/host/fetch/utils/resolveHostFetchRedirectMode';
import { serializeResponseToHostFetchResult } from '@/host/fetch/utils/serializeResponseToHostFetchResult';
import { type HostFetchFunction } from '@/types/HostFetchFunction';
import { type HostFetchInput } from '@/types/HostFetchInput';
import { type HostFetchPolicy } from '@/types/HostFetchPolicy';
import { type HostFetchResult } from '@/types/HostFetchResult';

export const createHostFetchEnforcingPolicy = (
  hostFetchPolicy: HostFetchPolicy,
): HostFetchFunction => {
  const allowedOriginSet = new Set(hostFetchPolicy.allowedOrigins);
  const fileStorageRedirectableUrlSet = new Set(
    hostFetchPolicy.fileStorageRedirectableUrls,
  );

  return async (input: HostFetchInput): Promise<HostFetchResult> => {
    const requestOrigin = getUrlSafely(input.url)?.origin;

    if (!isDefined(requestOrigin) || !allowedOriginSet.has(requestOrigin)) {
      throw new CustomError(
        `Front component host fetch blocked for disallowed origin: ${input.url}`,
        'FRONT_COMPONENT_HOST_FETCH_BLOCKED_ORIGIN',
      );
    }

    const requestMethod = isNonEmptyString(input.method)
      ? input.method.toUpperCase()
      : 'GET';

    // Page-origin requests carry the page's cookies so cookie-authenticating proxies
    // (Cloudflare Access, IAP, oauth2-proxy) let them through. The marker header makes
    // the server ignore the user session cookie, so app code still acts only with its own token.
    const isPageOriginRequest = requestOrigin === window.location.origin;
    const headers = new Headers(input.headers);

    if (isPageOriginRequest) {
      headers.set(FRONT_COMPONENT_HOST_FETCH_HEADER_NAME, '1');
    }

    const response = await fetch(input.url, {
      method: requestMethod,
      headers,
      body: input.body,
      credentials: isPageOriginRequest ? 'same-origin' : 'omit',
      redirect: resolveHostFetchRedirectMode(
        requestMethod,
        input.url,
        fileStorageRedirectableUrlSet,
      ),
    });

    return serializeResponseToHostFetchResult(response);
  };
};
