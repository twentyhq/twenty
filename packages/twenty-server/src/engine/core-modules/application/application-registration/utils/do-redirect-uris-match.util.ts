const LOOPBACK_HOSTNAMES = ['localhost', '127.0.0.1', '[::1]'];

const parseUrl = (url: string): URL | null => {
  try {
    return new URL(url);
  } catch {
    return null;
  }
};

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

  const registeredUrl = parseUrl(registeredRedirectUri);
  const requestedUrl = parseUrl(redirectUri);

  if (
    registeredUrl === null ||
    requestedUrl === null ||
    registeredUrl.protocol !== 'http:' ||
    !LOOPBACK_HOSTNAMES.includes(registeredUrl.hostname)
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
