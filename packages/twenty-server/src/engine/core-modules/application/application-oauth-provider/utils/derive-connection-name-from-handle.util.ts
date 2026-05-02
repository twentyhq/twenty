// Best-effort default name for a freshly-created connectedAccount row.
// Tries (in order): userinfo from token claims if it's a JWT, then a
// generic fallback `{ProviderDisplayName} #{N}` where N is provided by the
// caller (count of existing rows for the same scope+provider). The user
// can rename later from the UI.
export const deriveConnectionNameFromHandle = ({
  providerDisplayName,
  accessToken,
  fallbackIndex,
}: {
  providerDisplayName: string;
  accessToken: string;
  fallbackIndex: number;
}): string => {
  const claim = extractClaimFromAccessToken(accessToken);

  if (claim) {
    return claim;
  }

  return `${providerDisplayName} #${fallbackIndex}`;
};

const HANDLE_CLAIM_PRIORITY = [
  'email',
  'preferred_username',
  'login',
  'username',
  'name',
] as const;

const extractClaimFromAccessToken = (accessToken: string): string | null => {
  // Only attempt a parse if the token looks like a JWT (header.payload.sig).
  // Opaque tokens (the common case for OAuth2 access tokens) skip cleanly.
  const parts = accessToken.split('.');

  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8'),
    ) as Record<string, unknown>;

    for (const key of HANDLE_CLAIM_PRIORITY) {
      const value = payload[key];

      if (typeof value === 'string' && value.length > 0) {
        return value;
      }
    }
  } catch {
    return null;
  }

  return null;
};
