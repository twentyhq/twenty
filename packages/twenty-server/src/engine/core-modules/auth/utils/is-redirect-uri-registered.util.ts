const LOOPBACK_HOSTNAMES = ['localhost', '127.0.0.1', '[::1]'];

// RFC 8252 §7.3: native apps bind an ephemeral port, so loopback redirect URIs match on any port
export const normalizeRedirectUriForComparison = (uri: string): string => {
  let parsed: URL;

  try {
    parsed = new URL(uri);
  } catch {
    return uri;
  }

  if (
    parsed.protocol !== 'http:' ||
    !LOOPBACK_HOSTNAMES.includes(parsed.hostname)
  ) {
    return uri;
  }

  parsed.port = '';

  return parsed.toString();
};

export const isRedirectUriRegistered = (
  registeredRedirectUris: string[],
  redirectUri: string,
): boolean => {
  const normalizedRedirectUri = normalizeRedirectUriForComparison(redirectUri);

  return registeredRedirectUris.some(
    (registeredRedirectUri) =>
      normalizeRedirectUriForComparison(registeredRedirectUri) ===
      normalizedRedirectUri,
  );
};
