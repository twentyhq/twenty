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

  if (
    !isDefined(redirectUrl) ||
    redirectUrl.origin === requestUrl.origin ||
    !isProxySignInUrl(redirectUrl)
  ) {
    return undefined;
  }

  return redirectUrl.origin;
};
