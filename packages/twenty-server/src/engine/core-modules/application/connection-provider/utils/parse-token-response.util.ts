import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { addSeconds, fromUnixTime } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import { type TokenExchangeResponse } from 'src/engine/core-modules/application/connection-provider/types/token-exchange-response.type';
import { decodeJwtPayload } from 'src/engine/core-modules/jwt/utils/decode-jwt-payload.util';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';

const parseExpiresInSeconds = (expiresIn: unknown): number | null => {
  if (!isNumber(expiresIn) && !isNonEmptyString(expiresIn)) {
    return null;
  }

  const expiresInSeconds = Number(expiresIn);

  return Number.isFinite(expiresInSeconds) && expiresInSeconds > 0
    ? expiresInSeconds
    : null;
};

const parseAccessTokenExpiresAt = (
  expiresIn: unknown,
  accessToken: PlaintextString,
): Date | null => {
  const expiresInSeconds = parseExpiresInSeconds(expiresIn);

  if (isDefined(expiresInSeconds)) {
    return addSeconds(new Date(), expiresInSeconds);
  }

  const expirationEpochSeconds = decodeJwtPayload<{ exp?: unknown }>(
    accessToken,
  )?.exp;

  return isNumber(expirationEpochSeconds) &&
    Number.isFinite(expirationEpochSeconds)
    ? fromUnixTime(expirationEpochSeconds)
    : null;
};

export const parseTokenResponse = (
  json: Record<string, unknown>,
): TokenExchangeResponse => {
  if (!isNonEmptyString(json.access_token)) {
    throw new Error(
      `Token endpoint did not return an access_token. Response keys: ${Object.keys(json).join(', ')}`,
    );
  }

  const accessToken = json.access_token as PlaintextString;

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
    accessTokenExpiresAt: parseAccessTokenExpiresAt(
      json.expires_in,
      accessToken,
    ),
  };
};
