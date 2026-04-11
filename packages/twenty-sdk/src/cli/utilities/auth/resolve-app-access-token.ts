import { type ConfigService } from '@/cli/utilities/config/config-service';

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

/**
 * Exchanges an app registration's clientId + clientSecret for access/refresh
 * tokens via the OAuth client_credentials grant, then persists them in config.
 */
export const exchangeCredentialsForTokens = async (
  configService: ConfigService,
  params: { clientId: string; clientSecret: string },
): Promise<{ accessToken: string; refreshToken?: string }> => {
  const config = await configService.getConfig();

  const response = await fetch(`${config.apiUrl}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: params.clientId,
      client_secret: params.clientSecret,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Token exchange failed: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
  };

  await configService.setConfig({
    appAccessToken: data.access_token,
    ...(data.refresh_token ? { appRefreshToken: data.refresh_token } : {}),
  });

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  };
};

/**
 * Returns a valid appAccessToken from config, refreshing it first if expired.
 */
export const ensureValidAppAccessTokenOrRefresh = async (
  configService: ConfigService,
): Promise<string | undefined> => {
  const config = await configService.getConfig();

  if (!config.appAccessToken) {
    return undefined;
  }

  if (!isTokenExpired(config.appAccessToken)) {
    return config.appAccessToken;
  }

  if (!config.appRefreshToken || !config.appRegistrationClientId) {
    return undefined;
  }

  const response = await fetch(`${config.apiUrl}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: config.appRefreshToken,
      client_id: config.appRegistrationClientId,
    }),
  });

  if (!response.ok) {
    return undefined;
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
  };

  await configService.setConfig({
    appAccessToken: data.access_token,
    ...(data.refresh_token ? { appRefreshToken: data.refresh_token } : {}),
  });

  return data.access_token;
};
