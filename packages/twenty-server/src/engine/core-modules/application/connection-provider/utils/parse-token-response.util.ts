import { type TokenExchangeResponse } from 'src/engine/core-modules/application/connection-provider/types/token-exchange-response.type';
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

  return {
    accessToken,
    refreshToken:
      typeof json.refresh_token === 'string'
        ? (json.refresh_token as PlaintextString)
        : null,
    scopes:
      typeof json.scope === 'string'
        ? json.scope.split(/[\s,]+/).filter(Boolean)
        : null,
  };
};
