import { type ApiService } from '@/cli/utilities/api/api-service';

export type FindApplicationSuccess = {
  success: true;
  applicationId: string;
  universalIdentifier: string;
};

export type FindApplicationNotFound = {
  success: true;
  applicationId: null;
  universalIdentifier: string;
};

export type FindApplicationFailure = {
  success: false;
  error: string;
};

export type FindApplicationResult =
  | FindApplicationSuccess
  | FindApplicationNotFound
  | FindApplicationFailure;

export const findApplication = async ({
  apiService,
  universalIdentifier,
}: {
  apiService: ApiService;
  universalIdentifier: string;
}): Promise<FindApplicationResult> => {
  const findResult = await apiService.findOneApplication(universalIdentifier);

  if (!findResult.success) {
    return {
      success: false,
      error: `Failed to look up application: ${findResult.error instanceof Error ? findResult.error.message : String(findResult.error)}`,
    };
  }

  if (findResult.data) {
    return {
      success: true,
      applicationId: findResult.data.id,
      universalIdentifier: findResult.data.universalIdentifier,
    };
  }

  return {
    success: true,
    applicationId: null,
    universalIdentifier,
  };
};
