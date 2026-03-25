import fs from 'fs';

import { ApiService } from '@/cli/utilities/api/api-service';
import { ConfigService } from '@/cli/utilities/config/config-service';
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
  universalIdentifier: string;
};

const innerAppDeploy = async (
  options: AppDeployOptions,
): Promise<CommandResult<AppDeployResult>> => {
  const { tarballPath, onProgress } = options;

  if (options.remote) {
    ConfigService.setActiveRemote(options.remote);
  }

  onProgress?.(`Uploading ${tarballPath}...`);

  const tarballBuffer = fs.readFileSync(tarballPath);

  const apiService = new ApiService({
    serverUrl: options.serverUrl,
    token: options.token,
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
