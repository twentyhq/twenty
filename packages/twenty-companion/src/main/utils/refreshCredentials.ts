import { type TokenResponse } from '../types/TokenResponse';
import { type Credentials } from '../types/Credentials';
import { requestJson } from './requestJson';

export const refreshCredentials = async (
  credentials: Credentials,
): Promise<Credentials> => {
  const result = await requestJson<TokenResponse>(
    `${credentials.serverUrl}/oauth/token`,
    {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: credentials.refreshToken,
        client_id: credentials.clientId,
      }),
    },
  );
  return {
    ...credentials,
    accessToken: result.access_token,
    refreshToken: result.refresh_token,
    expiresAt: Date.now() + result.expires_in * 1000,
  };
};
