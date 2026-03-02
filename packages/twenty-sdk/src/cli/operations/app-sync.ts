import { ApiService } from '@/cli/utilities/api/api-service';
import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';
import { manifestUpdateChecksums } from '@/cli/utilities/build/manifest/manifest-update-checksums';
import { manifestValidate } from '@/cli/utilities/build/manifest/manifest-validate';
import { writeManifestToOutput } from '@/cli/utilities/build/manifest/manifest-writer';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { FileUploader } from '@/cli/utilities/file/file-uploader';
import { type Manifest } from 'twenty-shared/application';
import { appBuild, type BuiltFileInfo } from './app-build';
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

  const manifestResult = await buildManifest(options.appPath);

  if (manifestResult.errors.length > 0 || !manifestResult.manifest) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.MANIFEST_BUILD_FAILED,
        message:
          manifestResult.errors.join('\n') || 'Failed to build manifest.',
      },
    };
  }

  const validation = manifestValidate(manifestResult.manifest);

  if (!validation.isValid) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.MANIFEST_BUILD_FAILED,
        message: validation.errors.join('\n'),
      },
    };
  }

  const buildResult = await appBuild({
    appPath: options.appPath,
    manifest: manifestResult.manifest,
    filePaths: manifestResult.filePaths,
  });

  return syncBuiltApp({
    appPath: options.appPath,
    manifest: manifestResult.manifest,
    builtFileInfos: buildResult.builtFileInfos,
  });
};

const syncBuiltApp = async ({
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

  if (error === undefined) {
    return 'Unknown error';
  }

  return JSON.stringify(error);
};
