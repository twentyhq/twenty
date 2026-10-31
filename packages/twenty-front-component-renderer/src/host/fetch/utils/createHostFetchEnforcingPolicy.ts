import { isNonEmptyString } from '@sniptt/guards';
import { SESSION_COOKIE_OPT_IN_HEADER_NAME } from 'twenty-shared/constants';
import { CustomError, getUrlSafely, isDefined } from 'twenty-shared/utils';

import { isPageCookieEligiblePath } from '@/host/fetch/utils/isPageCookieEligiblePath';
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
    const requestUrl = getUrlSafely(input.url);

    if (!isDefined(requestUrl) || !allowedOriginSet.has(requestUrl.origin)) {
      throw new CustomError(
        `Front component host fetch blocked for disallowed origin: ${input.url}`,
        'FRONT_COMPONENT_HOST_FETCH_BLOCKED_ORIGIN',
      );
    }

    const requestMethod = isNonEmptyString(input.method)
      ? input.method.toUpperCase()
      : 'GET';

    const redirectMode = resolveHostFetchRedirectMode(
      requestMethod,
      input.url,
      fileStorageRedirectableUrlSet,
    );

    // Cookies let auth proxies (Cloudflare Access, IAP, oauth2-proxy) through; without the opt-in header the server gives them no session.
    const shouldSendPageCookies =
      requestUrl.origin === window.location.origin &&
      isPageCookieEligiblePath(requestUrl.pathname);
    const headers = new Headers(input.headers);

    headers.delete(SESSION_COOKIE_OPT_IN_HEADER_NAME);

    const response = await fetch(input.url, {
      method: requestMethod,
      headers,
      body: input.body,
      credentials: shouldSendPageCookies ? 'same-origin' : 'omit',
      redirect: redirectMode,
    });

    return serializeResponseToHostFetchResult(response);
  };
};
