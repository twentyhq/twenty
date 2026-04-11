import { type ApiService } from '@/cli/utilities/api/api-service';
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

/**
 * Ensures we have a valid app access token by:
 * 1. Returning an existing valid token from config if available
 * 2. Creating a new registration if none exists
 * 3. Finding the existing registration and rotating the secret if already claimed
 * 4. Exchanging credentials for tokens in all cases
 */
export const ensureAppRegistrationAndTokens = async (
  apiService: ApiService,
  configService: ConfigService,
  app: { name: string; universalIdentifier: string },
): Promise<{
  appAccessToken: string;
  isNewRegistration: boolean;
}> => {
  const existingToken = await ensureValidAppAccessTokenOrRefresh(configService);

  if (existingToken) {
    return { appAccessToken: existingToken, isNewRegistration: false };
  }

  const createResult = await apiService.createApplicationRegistration({
    name: app.name,
    universalIdentifier: app.universalIdentifier,
  });

  if (createResult.success && createResult.data) {
    const { applicationRegistration, clientSecret } = createResult.data;

    await configService.setConfig({
      appRegistrationId: applicationRegistration.id,
      appRegistrationClientId: applicationRegistration.oAuthClientId,
    });

    const tokens = await exchangeCredentialsForTokens(configService, {
      clientId: applicationRegistration.oAuthClientId,
      clientSecret,
    });

    return { appAccessToken: tokens.accessToken, isNewRegistration: true };
  }

  // Registration already exists — find it and rotate the secret to get
  // fresh credentials (the original secret is only returned at creation).
  const findResult =
    await apiService.findApplicationRegistrationByUniversalIdentifier(
      app.universalIdentifier,
    );

  if (!findResult.success || !findResult.data) {
    throw new Error(
      `App registration exists but could not be found: ${app.universalIdentifier}`,
    );
  }

  const registration = findResult.data;

  await configService.setConfig({
    appRegistrationId: registration.id,
    appRegistrationClientId: registration.oAuthClientId,
  });

  const rotateResult =
    await apiService.rotateApplicationRegistrationClientSecret(registration.id);

  if (!rotateResult.success || !rotateResult.data) {
    throw new Error(
      `Failed to rotate client secret for registration ${registration.id}`,
    );
  }

  const tokens = await exchangeCredentialsForTokens(configService, {
    clientId: registration.oAuthClientId,
    clientSecret: rotateResult.data.clientSecret,
  });

  return { appAccessToken: tokens.accessToken, isNewRegistration: false };
};
