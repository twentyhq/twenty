import { type ApiService } from '@/cli/utilities/api/api-service';
import { serializeError } from '@/cli/utilities/error/serialize-error';
import { type Manifest } from 'twenty-shared/application';

export type EnsureApplicationSuccess = {
  success: true;
  applicationId: string;
  universalIdentifier: string;
  created: boolean;
};

export type EnsureApplicationFailure = {
  success: false;
  error: string;
};

export type EnsureApplicationResult =
  | EnsureApplicationSuccess
  | EnsureApplicationFailure;

export const findOrCreateApplication = async ({
  apiService,
  manifest,
  applicationRegistrationId,
}: {
  apiService: ApiService;
  manifest: Manifest;
  applicationRegistrationId?: string;
}): Promise<EnsureApplicationResult> => {
  const universalIdentifier = manifest.application.universalIdentifier;

  const findResult = await apiService.findOneApplication(universalIdentifier);

  if (!findResult.success) {
    return {
      success: false,
      error: `Failed to resolve application: ${serializeError(findResult.error)}`,
    };
  }

  if (findResult.data) {
    return {
      success: true,
      applicationId: findResult.data.id,
      universalIdentifier: findResult.data.universalIdentifier,
      created: false,
    };
  }

  let registrationId = applicationRegistrationId;

  if (!registrationId) {
    const registerResult =
      await apiService.findApplicationRegistrationByUniversalIdentifier(
        universalIdentifier,
      );

    if (registerResult.success && registerResult.data) {
      registrationId = registerResult.data.id;
    }
  }

  const createResult = await apiService.createApplication(manifest, {
    applicationRegistrationId: registrationId,
  });

  if (!createResult.success) {
    return {
      success: false,
      error: `Failed to create application: ${serializeError(createResult.error)}`,
    };
  }

  return {
    success: true,
    applicationId: createResult.data!.id,
    universalIdentifier: createResult.data!.universalIdentifier,
    created: true,
  };
};
