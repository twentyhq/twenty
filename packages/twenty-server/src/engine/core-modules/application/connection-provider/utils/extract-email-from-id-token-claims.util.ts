import { isDefined } from 'twenty-shared/utils';

import { decodeJwtPayload } from 'src/engine/core-modules/jwt/utils/decode-jwt-payload.util';

// OIDC only guarantees `sub`, so the account email lands in a different claim
// depending on the provider: `email` (Google, Slack, Okta, Auth0, Apple),
// `upn` (Microsoft Entra ID v1.0 tokens) or `preferred_username` (Entra ID
// v2.0 tokens, Salesforce).
const EMAIL_CLAIM_NAMES = ['email', 'upn', 'preferred_username'] as const;

// `preferred_username` is a display handle rather than an address on several
// providers (Twitch returns "dallas", GitLab and Keycloak return the username),
// so a claim only counts as a handle when it actually looks like an address.
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+$/;

export const extractEmailFromIdTokenClaims = (
  idToken: string | null,
): string | null => {
  if (!isDefined(idToken)) {
    return null;
  }

  const claims = decodeJwtPayload<Record<string, unknown>>(idToken);

  if (!isDefined(claims)) {
    return null;
  }

  for (const claimName of EMAIL_CLAIM_NAMES) {
    const claimValue = claims[claimName];

    if (typeof claimValue !== 'string') {
      continue;
    }

    const email = claimValue.trim();

    if (EMAIL_SHAPE.test(email)) {
      return email;
    }
  }

  return null;
};
