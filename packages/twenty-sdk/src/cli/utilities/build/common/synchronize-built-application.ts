import {
  APP_ERROR_CODES,
  type CommandResult,
} from '@/cli/public-operations/types';
import { ApiService } from '@/cli/utilities/api/api-service';
import { type BuiltFileInfo } from '@/cli/utilities/build/common/build-application';
import { manifestUpdateChecksums } from '@/cli/utilities/build/manifest/manifest-update-checksums';
import { writeManifestToOutput } from '@/cli/utilities/build/manifest/manifest-writer';
import { serializeError } from '@/cli/utilities/error/serialize-error';
import { FileUploader } from '@/cli/utilities/file/file-uploader';
import { type Manifest } from 'twenty-shared/application';

export type AppSyncOptions = {
  appPath: string;
  workspace?: string;
};

const ensureApplicationRegistrationExists = async (
  apiService: ApiService,
  manifest: Manifest,
): Promise<CommandResult> => {
  const universalIdentifier = manifest.application.universalIdentifier;

  const findResult =
    await apiService.findApplicationRegistrationByUniversalIdentifier(
      universalIdentifier,
    );

  if (findResult.success && findResult.data) {
    return { success: true, data: undefined };
  }

  const createResult = await apiService.createApplicationRegistration({
    name: manifest.application.displayName,
    description: manifest.application.description,
    universalIdentifier,
  });

  if (!createResult.success) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.SYNC_FAILED,
        message: `Failed to create application registration: ${serializeError(createResult.error)}`,
      },
    };
  }

  return { success: true, data: undefined };
};

const ensureDevelopmentApplicationExists = async (
  apiService: ApiService,
  manifest: Manifest,
): Promise<CommandResult> => {
  const result = await apiService.createDevelopmentApplication({
    universalIdentifier: manifest.application.universalIdentifier,
    name: manifest.application.displayName,
  });

  if (!result.success) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.SYNC_FAILED,
        message: `Failed to create development application: ${serializeError(result.error)}`,
      },
    };
  }

  return { success: true, data: undefined };
};

export const synchronizeBuiltApplication = async ({
  appPath,
  manifest,
  builtFileInfos,
}: {
  appPath: string;
  manifest: Manifest;
  builtFileInfos: Map<string, BuiltFileInfo>;
}): Promise<CommandResult> => {
  const apiService = new ApiService();
  const universalIdentifier = manifest.application.universalIdentifier;

  const registrationResult = await ensureApplicationRegistrationExists(
    apiService,
    manifest,
  );

  if (!registrationResult.success) {
    return registrationResult;
  }

  const applicationResult = await ensureDevelopmentApplicationExists(
    apiService,
    manifest,
  );

  if (!applicationResult.success) {
    return applicationResult;
  }

  const fileUploader = new FileUploader({
    applicationUniversalIdentifier: universalIdentifier,
    appPath,
  });

  const uploadResults = await Promise.all(
    [...builtFileInfos.values()].map((fileInfo) =>
      fileUploader.uploadFile({
        builtPath: fileInfo.builtPath,
        fileFolder: fileInfo.fileFolder,
      }),
    ),
  );

  const failedUploads = uploadResults.filter((result) => !result.success);

  if (failedUploads.length > 0) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.SYNC_FAILED,
        message: `Failed to upload ${failedUploads.length} file(s).`,
      },
    };
  }

  const updatedManifest = manifestUpdateChecksums({
    manifest,
    builtFileInfos,
  });

  await writeManifestToOutput(appPath, updatedManifest);

  const syncResult = await apiService.syncApplication(updatedManifest);

  if (!syncResult.success) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.SYNC_FAILED,
        message: `Sync failed: ${serializeError(syncResult.error)}`,
      },
    };
  }

  return { success: true, data: undefined };
};
