import { type ApiService } from '@/cli/utilities/api/api-service';
import { type ConfigService } from '@/cli/utilities/config/config-service';
import { hasGraphQLErrorSubCode } from '@/cli/utilities/error/parse-server-error';

export const ensureAppRegistration = async (
  apiService: ApiService,
  configService: ConfigService,
  app: { name: string; universalIdentifier: string },
): Promise<{
  clientId: string;
  clientSecret: string;
  isNewRegistration: boolean;
}> => {
  const createResult = await apiService.createApplicationRegistration({
    name: app.name,
    universalIdentifier: app.universalIdentifier,
  });

  if (createResult.success) {
    const { applicationRegistration, clientSecret } = createResult.data;

    await configService.setConfig({
      appRegistrationId: applicationRegistration.id,
      appRegistrationClientId: applicationRegistration.oAuthClientId,
      appAccessToken: undefined,
      appRefreshToken: undefined,
    });

    return {
      clientId: applicationRegistration.oAuthClientId,
      clientSecret,
      isNewRegistration: true,
    };
  }

  const isAlreadyClaimed = hasGraphQLErrorSubCode(
    createResult.error,
    'UNIVERSAL_IDENTIFIER_ALREADY_CLAIMED',
  );

  if (!isAlreadyClaimed) {
    const errorDetail =
      createResult.error instanceof Error
        ? createResult.error.message
        : ((createResult.error as { message?: string })?.message ??
          String(createResult.error));

    throw new Error(`Failed to create app registration: ${errorDetail}`);
  }

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
    appAccessToken: undefined,
    appRefreshToken: undefined,
  });

  const rotateResult =
    await apiService.rotateApplicationRegistrationClientSecret(registration.id);

  if (!rotateResult.success || !rotateResult.data) {
    throw new Error(
      `Failed to rotate client secret for registration ${registration.id}`,
    );
  }

  return {
    clientId: registration.oAuthClientId,
    clientSecret: rotateResult.data.clientSecret,
    isNewRegistration: false,
  };
};
