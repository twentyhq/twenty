import fs from 'fs';

import { ApiService } from '@/cli/utilities/api/api-service';
import { isMissingGraphqlFieldError } from '@/cli/utilities/api/is-missing-graphql-field-error';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { serializeError } from '@/cli/utilities/error/serialize-error';
import { putFileToUploadUrl } from '@/cli/utilities/file/put-file-to-upload-url';
import { runSafe } from '@/cli/utilities/run-safe';
import { APP_ERROR_CODES, type CommandResult } from '@/cli/types';

export type AppDeployOptions = {
  tarballPath: string;
  remote?: string;
  serverUrl?: string;
  token?: string;
  onProgress?: (message: string) => void;
};

export type AppDeployResult = {
  id: string;
  name: string;
  universalIdentifier: string;
};

const buildDeployFailure = (
  message: string,
): CommandResult<AppDeployResult> => ({
  success: false,
  error: {
    code: APP_ERROR_CODES.DEPLOY_FAILED,
    message,
  },
});

// Servers predating the direct upload mutations still take the tarball as a
// multipart request through the API.
const deployThroughApi = async ({
  apiService,
  tarballPath,
}: {
  apiService: ApiService;
  tarballPath: string;
}): Promise<CommandResult<AppDeployResult>> => {
  const uploadResult = await apiService.uploadAppTarball({
    tarballBuffer: fs.readFileSync(tarballPath),
  });

  if (!uploadResult.success) {
    return buildDeployFailure(`Upload failed: ${uploadResult.error}`);
  }

  return {
    success: true,
    data: uploadResult.data,
  };
};

const innerAppDeploy = async (
  options: AppDeployOptions,
): Promise<CommandResult<AppDeployResult>> => {
  const { tarballPath, onProgress } = options;

  if (options.remote) {
    ConfigService.setActiveRemote(options.remote);
  }

  onProgress?.(`Uploading ${tarballPath}...`);

  const apiService = new ApiService({
    serverUrl: options.serverUrl,
    token: options.token,
  });

  const { size } = await fs.promises.stat(tarballPath);

  const createResult = await apiService.createAppTarballUpload({ size });

  if (!createResult.success) {
    const error = createResult.error ?? createResult.message;

    if (
      isMissingGraphqlFieldError({
        error,
        fieldNames: ['createAppTarballUpload'],
      })
    ) {
      return deployThroughApi({ apiService, tarballPath });
    }

    return buildDeployFailure(`Upload failed: ${serializeError(error)}`);
  }

  const { fileId, uploadUrl, contentType } = createResult.data;

  try {
    await putFileToUploadUrl({
      absolutePath: tarballPath,
      uploadUrl,
      contentType,
    });
  } catch (error) {
    return buildDeployFailure(`Upload failed: ${serializeError(error)}`);
  }

  onProgress?.('Registering application...');

  const completeResult = await apiService.completeAppTarballUpload({ fileId });

  if (!completeResult.success) {
    return buildDeployFailure(
      `Upload failed: ${serializeError(completeResult.error ?? completeResult.message)}`,
    );
  }

  return {
    success: true,
    data: completeResult.data,
  };
};

export const appDeploy = (
  options: AppDeployOptions,
): Promise<CommandResult<AppDeployResult>> =>
  runSafe(() => innerAppDeploy(options), APP_ERROR_CODES.DEPLOY_FAILED);
