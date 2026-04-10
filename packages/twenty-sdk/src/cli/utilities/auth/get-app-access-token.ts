import { type ConfigService } from '@/cli/utilities/config/config-service';

type ClientCredentialsResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
};

/**
 * Obtains an APPLICATION_ACCESS token for the app's installed instance.
 *
 * The CoreApiClient must be generated with a token that carries the app's
 * applicationId so the server returns the app-scoped schema (only the objects
 * and fields the app owns or is allowed to see).
 *
 * We use the OAuth client_credentials grant with the app registration's
 * clientId and clientSecret (persisted in config on first registration).
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
  if (!appRegistrationClientId || !appRegistrationClientSecret) {
    throw new Error(
      'App registration credentials not found. ' +
        'Delete ~/.twenty/config.json and re-run to trigger a fresh registration.',
    );
  }

  const config = await configService.getConfig();

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

  return data.access_token;
};
