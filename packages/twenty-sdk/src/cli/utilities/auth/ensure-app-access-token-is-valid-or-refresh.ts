import { type ConfigService } from '@/cli/utilities/config/config-service';

import { exchangeCredentialsForTokens } from './exchange-credentials-for-tokens';

const EXPIRATION_MARGIN_MS = 30_000;

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString(),
    );

    return payload.exp * 1_000 < Date.now() + EXPIRATION_MARGIN_MS;
  } catch {
    return false;
  }
};

export const ensureAppAccessTokenIsValidOrRefresh = async (
  configService: ConfigService,
  credentials?: { clientId: string; clientSecret: string },
): Promise<string | undefined> => {
  const config = await configService.getConfig();

  if (config.appAccessToken && !isTokenExpired(config.appAccessToken)) {
    return config.appAccessToken;
  }

  if (config.appRefreshToken && config.appRegistrationClientId) {
    const response = await fetch(`${config.apiUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: config.appRefreshToken,
        client_id: config.appRegistrationClientId,
      }),
    });

    if (response.ok) {
      const data = (await response.json()) as {
        access_token: string;
        refresh_token?: string;
      };

      await configService.setConfig({
        appAccessToken: data.access_token,
        ...(data.refresh_token ? { appRefreshToken: data.refresh_token } : {}),
      });

      return data.access_token;
    }
  }

  if (credentials) {
    const result = await exchangeCredentialsForTokens(
      configService,
      credentials,
    );

    return result.accessToken;
  }

  return undefined;
};
