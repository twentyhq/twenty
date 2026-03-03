import {
  APP_ERROR_CODES,
  type CommandResult,
} from '@/cli/public-operations/types';
import { ApiService } from '@/cli/utilities/api/api-service';
import { findOrCreateApplication } from '@/cli/utilities/application/find-or-create-application';
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

  const ensureResult = await findOrCreateApplication({
    apiService,
    manifest,
  });

  if (!ensureResult.success) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.SYNC_FAILED,
        message: ensureResult.error,
      },
    };
  }

  const universalIdentifier = manifest.application.universalIdentifier;

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
        message: `Sync failed: ${serializeError(syncResult.error)}`,
      },
    };
  }

  return { success: true, data: undefined };
};
