// RFC 6749 redirect URI validation: must be absolute, HTTPS (except localhost), no fragments
export const validateRedirectUri = (
  uri: string,
): { valid: true; parsed: URL } | { valid: false; reason: string } => {
  let parsed: URL;

  try {
    parsed = new URL(uri);
  } catch {
    return { valid: false, reason: `Invalid redirect URI: ${uri}` };
  }

  const isLocalhost =
    parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';

  if (parsed.protocol !== 'https:' && !isLocalhost) {
    return {
      valid: false,
      reason: `Redirect URIs must use HTTPS (except localhost): ${uri}`,
    };
  }

  if (parsed.hash) {
    return {
      valid: false,
      reason: `Redirect URIs must not contain fragments: ${uri}`,
    };
  }

  return { valid: true, parsed };
};
