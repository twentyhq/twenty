import { ApiService } from '@/cli/utilities/api/api-service';
import { manifestUpdateChecksums } from '@/cli/utilities/build/manifest/manifest-update-checksums';
import { writeManifestToOutput } from '@/cli/utilities/build/manifest/manifest-writer';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { FileUploader } from '@/cli/utilities/file/file-uploader';
import { appBuild, type AppBuildResult } from './app-build';
import { APP_ERROR_CODES, type CommandResult } from './types';

export type AppSyncOptions = {
  appPath: string;
  workspace?: string;
};

export const appSync = async (
  options: AppSyncOptions,
): Promise<CommandResult> => {
  if (options.workspace) {
    ConfigService.setActiveWorkspace(options.workspace);
  }

  const buildResult = await appBuild({ appPath: options.appPath });

  if (!buildResult.success) {
    return buildResult;
  }

  return syncBuiltApp({
    appPath: options.appPath,
    buildData: buildResult.data,
  });
};

const syncBuiltApp = async ({
  appPath,
  buildData,
}: {
  appPath: string;
  buildData: AppBuildResult;
}): Promise<CommandResult> => {
  const apiService = new ApiService();
  const { manifest, builtFileInfos } = buildData;
  const universalIdentifier = manifest.application.universalIdentifier;

  const resolveResult =
    await apiService.findOneApplication(universalIdentifier);

  if (!resolveResult.success) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.SYNC_FAILED,
        message: `Failed to resolve application: ${serializeApiError(resolveResult.error)}`,
      },
    };
  }

  if (!resolveResult.data) {
    const registerResult =
      await apiService.findApplicationRegistrationByUniversalIdentifier(
        universalIdentifier,
      );

    const createResult = await apiService.createApplication(manifest, {
      applicationRegistrationId: registerResult.success
        ? registerResult.data?.id
        : undefined,
    });

    if (!createResult.success) {
      return {
        success: false,
        error: {
          code: APP_ERROR_CODES.SYNC_FAILED,
          message: `Failed to create application: ${serializeApiError(createResult.error)}`,
        },
      };
    }
  }

  const fileUploader = new FileUploader({
    applicationUniversalIdentifier: universalIdentifier,
    appPath,
  });

  const uploadPromises = Array.from(builtFileInfos.values()).map((fileInfo) =>
    fileUploader.uploadFile({
      builtPath: fileInfo.builtPath,
      fileFolder: fileInfo.fileFolder,
    }),
  );

  const uploadResults = await Promise.all(uploadPromises);
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
        message: `Sync failed: ${serializeApiError(syncResult.error)}`,
      },
    };
  }

  return { success: true, data: undefined };
};

const serializeApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return JSON.stringify(error) ?? 'Unknown error';
};
