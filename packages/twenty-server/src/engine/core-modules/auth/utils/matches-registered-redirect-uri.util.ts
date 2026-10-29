const parseUri = (uri: string): URL | null => {
  try {
    return new URL(uri);
  } catch {
    return null;
  }
};

const isLoopbackUrl = (url: URL): boolean =>
  url.hostname === 'localhost' || url.hostname === '127.0.0.1';

// RFC 8252 §7.3: a loopback redirect URI matches on any port, since native apps bind a free port per sign-in
export const matchesRegisteredRedirectUri = (
  registeredUri: string,
  requestedUri: string,
): boolean => {
  if (registeredUri === requestedUri) {
    return true;
  }

  const registeredUrl = parseUri(registeredUri);
  const requestedUrl = parseUri(requestedUri);

  if (
    registeredUrl === null ||
    requestedUrl === null ||
    !isLoopbackUrl(registeredUrl) ||
    !isLoopbackUrl(requestedUrl)
  ) {
    return false;
  }

  return (
    registeredUrl.protocol === requestedUrl.protocol &&
    registeredUrl.hostname === requestedUrl.hostname &&
    registeredUrl.pathname === requestedUrl.pathname &&
    registeredUrl.search === requestedUrl.search
  );
};
