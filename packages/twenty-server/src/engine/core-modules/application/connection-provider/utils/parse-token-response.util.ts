import { isNonEmptyString } from '@sniptt/guards';

import { type TokenExchangeResponse } from 'src/engine/core-modules/application/connection-provider/types/token-exchange-response.type';
import { parseAccessTokenExpiresAt } from 'src/engine/core-modules/application/connection-provider/utils/parse-access-token-expires-at.util';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';

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
