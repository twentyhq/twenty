import { isNonEmptyString } from 'twenty-shared/utils';

import { type TokenExchangeResponse } from 'src/engine/core-modules/application/connection-provider/types/token-exchange-response.type';
import { decodeJwtPayload } from 'src/engine/core-modules/jwt/utils/decode-jwt-payload.util';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';

export const parseTokenResponse = (
  json: Record<string, unknown>,
): TokenExchangeResponse => {
  const accessToken = isNonEmptyString(json.access_token)
    ? (json.access_token as PlaintextString)
    : null;

  if (!accessToken) {
    throw new Error(
      `Token endpoint did not return an access_token. Response keys: ${Object.keys(json).join(', ')}`,
    );
  }

  let expiresAt: Date | null = null;
  const rawExpiresIn = json.expires_in;
  const expiresInNumber =
    typeof rawExpiresIn === 'number'
      ? rawExpiresIn
      : isNonEmptyString(rawExpiresIn) && isNonEmptyString(rawExpiresIn.trim())
        ? Number(rawExpiresIn)
        : null;

  if (
    expiresInNumber !== null &&
    Number.isFinite(expiresInNumber) &&
    expiresInNumber > 0
  ) {
    expiresAt = new Date(Date.now() + expiresInNumber * 1000);
  } else {
    const claims = decodeJwtPayload<{ exp?: number }>(accessToken);

    if (typeof claims?.exp === 'number' && Number.isFinite(claims.exp)) {
      expiresAt = new Date(claims.exp * 1000);
    }
  }

  return {
    accessToken,
    refreshToken: isNonEmptyString(json.refresh_token)
      ? (json.refresh_token as PlaintextString)
      : null,
    idToken: isNonEmptyString(json.id_token)
      ? (json.id_token as PlaintextString)
      : null,
    scopes: isNonEmptyString(json.scope)
      ? json.scope.split(/[\s,]+/).filter(Boolean)
      : null,
    expiresAt,
  };
};
