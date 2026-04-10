import { type ConfigService } from '@/cli/utilities/config/config-service';

type ClientCredentialsResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
};

/**
 * Returns an APPLICATION_ACCESS token for the app's installed instance.
 *
 * 1. If a valid token is already stored in config → returns it immediately.
 * 2. If clientId + clientSecret are provided (fresh registration or rotation)
 *    → performs a client_credentials grant, persists the resulting token in
 *    config, and returns it.  The secret is never persisted — only the token.
 *
 * The server resolves the workspace from the single Application row linked
 * to the ApplicationRegistration (there is always exactly one in dev mode).
 */
export const getAppAccessToken = async ({
  configService,
  appRegistrationClientId,
  appRegistrationClientSecret,
}: {
  configService: ConfigService;
  appRegistrationClientId?: string;
  appRegistrationClientSecret?: string;
}): Promise<string> => {
  const config = await configService.getConfig();

  if (config.appAccessToken) {
    return config.appAccessToken;
  }

  if (!appRegistrationClientId || !appRegistrationClientSecret) {
    throw new Error(
      'No app access token in config and no registration credentials provided. ' +
        'Delete ~/.twenty/config.json and re-run to trigger a fresh registration.',
    );
  }

  const response = await fetch(`${config.apiUrl}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: appRegistrationClientId,
      client_secret: appRegistrationClientSecret,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to obtain application access token: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ClientCredentialsResponse;

  await configService.setConfig({ appAccessToken: data.access_token });

  return data.access_token;
};
