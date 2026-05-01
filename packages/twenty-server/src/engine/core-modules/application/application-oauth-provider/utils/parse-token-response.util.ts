import { type TokenExchangeResponse } from 'src/engine/core-modules/application/application-oauth-provider/types/token-exchange-response.type';

export const parseTokenResponse = (
  json: Record<string, unknown>,
): TokenExchangeResponse => {
  const accessToken =
    typeof json.access_token === 'string' ? json.access_token : null;

  if (!accessToken) {
    throw new Error(
      `Token endpoint did not return an access_token. Response keys: ${Object.keys(json).join(', ')}`,
    );
  }

  const refreshToken =
    typeof json.refresh_token === 'string' ? json.refresh_token : null;

  const scopesRaw = json.scope;
  const scopes =
    typeof scopesRaw === 'string'
      ? scopesRaw.split(/[\s,]+/).filter(Boolean)
      : null;

  const expiresInSeconds =
    typeof json.expires_in === 'number' ? json.expires_in : null;

  return {
    accessToken,
    refreshToken,
    scopes,
    expiresInMs: expiresInSeconds !== null ? expiresInSeconds * 1000 : null,
    raw: json,
  };
};
