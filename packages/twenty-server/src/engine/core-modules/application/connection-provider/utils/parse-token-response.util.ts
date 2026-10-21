import { isDefined } from 'twenty-shared/utils';

import { type TokenExchangeResponse } from 'src/engine/core-modules/application/connection-provider/types/token-exchange-response.type';
import { decodeJwtPayload } from 'src/engine/core-modules/jwt/utils/decode-jwt-payload.util';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';

export const parseTokenResponse = (
  json: Record<string, unknown>,
): TokenExchangeResponse => {
  const accessToken =
    typeof json.access_token === 'string'
      ? (json.access_token as PlaintextString)
      : null;

  if (!accessToken) {
    throw new Error(
      `Token endpoint did not return an access_token. Response keys: ${Object.keys(json).join(', ')}`,
    );
  }

  let rawExpiresIn: number | null = null;

  if (typeof json.expires_in === 'number' && Number.isFinite(json.expires_in)) {
    rawExpiresIn = json.expires_in;
  } else if (
    typeof json.expires_in === 'string' &&
    json.expires_in.trim() !== '' &&
    Number.isFinite(Number(json.expires_in))
  ) {
    rawExpiresIn = Number(json.expires_in);
  }

  let expiresIn: number | null = null;

  if (isDefined(rawExpiresIn) && rawExpiresIn > 0) {
    expiresIn = rawExpiresIn;
  } else {
    const claims = decodeJwtPayload<{ exp?: number }>(accessToken);

    if (isDefined(claims?.exp) && typeof claims.exp === 'number') {
      const remainingSeconds = claims.exp - Math.floor(Date.now() / 1000);

      expiresIn = Math.max(0, remainingSeconds);
    } else if (isDefined(rawExpiresIn)) {
      expiresIn = Math.max(0, rawExpiresIn);
    }
  }

  return {
    accessToken,
    refreshToken:
      typeof json.refresh_token === 'string'
        ? (json.refresh_token as PlaintextString)
        : null,
    idToken:
      typeof json.id_token === 'string'
        ? (json.id_token as PlaintextString)
        : null,
    scopes:
      typeof json.scope === 'string'
        ? json.scope.split(/[\s,]+/).filter(Boolean)
        : null,
    expiresIn,
  };
};
