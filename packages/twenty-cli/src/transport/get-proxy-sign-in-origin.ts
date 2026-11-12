import { isDefined } from 'twenty-shared/utils';

import { isProxySignInUrl } from '@/transport/is-proxy-sign-in-url';

export const getProxySignInOrigin = (response: Response, requestUrl: URL) => {
  if (response.status < 300 || response.status >= 400) {
    return undefined;
  }

  const location = response.headers.get('location');
  const redirectUrl = isDefined(location)
    ? URL.parse(location, requestUrl.href)
    : null;

  return isDefined(redirectUrl) &&
    redirectUrl.origin !== requestUrl.origin &&
    isProxySignInUrl(redirectUrl)
    ? redirectUrl.origin
    : undefined;
};
