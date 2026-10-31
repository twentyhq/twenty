import { getUrlSafely, isDefined } from 'twenty-shared/utils';

import { isLoopbackHostname } from 'src/engine/core-modules/auth/utils/is-loopback-hostname.util';

// RFC 8252 §7.3: native apps bind an ephemeral port, so a registered loopback callback matches on any port
export const doRedirectUrisMatch = ({
  registeredRedirectUri,
  redirectUri,
}: {
  registeredRedirectUri: string;
  redirectUri: string;
}): boolean => {
  if (registeredRedirectUri === redirectUri) {
    return true;
  }

  const registeredUrl = getUrlSafely(registeredRedirectUri);
  const requestedUrl = getUrlSafely(redirectUri);

  if (
    !isDefined(registeredUrl) ||
    !isDefined(requestedUrl) ||
    registeredUrl.protocol !== 'http:' ||
    !isLoopbackHostname(registeredUrl.hostname)
  ) {
    return false;
  }

  return (
    requestedUrl.protocol === registeredUrl.protocol &&
    requestedUrl.hostname === registeredUrl.hostname &&
    requestedUrl.pathname === registeredUrl.pathname &&
    requestedUrl.search === registeredUrl.search
  );
};
