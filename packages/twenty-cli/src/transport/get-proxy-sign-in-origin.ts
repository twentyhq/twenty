import { isDefined } from 'twenty-shared/utils';

import { isProxySignInUrl } from '@/transport/is-proxy-sign-in-url';

export const getProxySignInOrigin = ({
  response,
  requestUrl,
}: {
  response: Response;
  requestUrl: URL;
}) => {
  if (response.status < 300 || response.status >= 400) {
    return undefined;
  }

  const location = response.headers.get('location');

  if (!isDefined(location)) {
    return undefined;
  }

  const redirectUrl = URL.parse(location, requestUrl.href);

  // Same-origin counts too: oauth2-proxy redirects to /oauth2/start on the proxied host.
  if (!isDefined(redirectUrl) || !isProxySignInUrl(redirectUrl)) {
    return undefined;
  }

  return redirectUrl.origin;
};
