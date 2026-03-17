import fs from 'fs';

import { ApiService } from '@/cli/utilities/api/api-service';
import { runSafe } from '@/cli/utilities/run-safe';
import { appBuild } from './build';
import { APP_ERROR_CODES, type CommandResult } from '@/cli/types';

export type AppDeployOptions = {
  appPath: string;
  serverUrl: string;
  token?: string;
  onProgress?: (message: string) => void;
};

export type AppDeployResult = {
  universalIdentifier: string;
};

const innerAppDeploy = async (
  options: AppDeployOptions,
): Promise<CommandResult<AppDeployResult>> => {
  const { appPath, serverUrl, token, onProgress } = options;

  const buildResult = await appBuild({
    appPath,
    tarball: true,
    onProgress,
  });

  if (!buildResult.success) {
    return buildResult;
  }

  onProgress?.(`Uploading ${buildResult.data.tarballPath}...`);

  const tarballBuffer = fs.readFileSync(buildResult.data.tarballPath!);

  const apiService = new ApiService({
    serverUrl,
    token,
  });

  const uploadResult = await apiService.uploadAppTarball({ tarballBuffer });

  if (!uploadResult.success) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.DEPLOY_FAILED,
        message: `Upload failed: ${uploadResult.error}`,
      },
    };
  }

  onProgress?.('Installing application...');

  const installResult = await apiService.installTarballApp({
    universalIdentifier: uploadResult.data.universalIdentifier,
  });

  if (!installResult.success) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.DEPLOY_FAILED,
        message: `Install failed: ${installResult.error}`,
      },
    };
  }

  return {
    success: true,
    data: {
      universalIdentifier: uploadResult.data.universalIdentifier,
    },
  };
};

export const appDeploy = (
  options: AppDeployOptions,
): Promise<CommandResult<AppDeployResult>> =>
  runSafe(() => innerAppDeploy(options), APP_ERROR_CODES.DEPLOY_FAILED);
