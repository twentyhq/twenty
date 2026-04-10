import { type ConfigService } from '@/cli/utilities/config/config-service';

/**
 * Reads the stored APPLICATION_ACCESS token from config.
 *
 * The token is persisted during app registration (create → client_credentials
 * exchange → store).  Callers that generate the CoreApiClient use this to
 * authenticate as the app so the server returns the app-scoped schema.
 */
export const getAppAccessToken = async ({
  configService,
}: {
  configService: ConfigService;
}): Promise<string> => {
  const config = await configService.getConfig();

  if (!config.appAccessToken) {
    throw new Error(
      'No app access token found in config. ' +
        'Run `yarn twenty dev` or `yarn twenty dev --once` to register the app first.',
    );
  }

  return config.appAccessToken;
};
