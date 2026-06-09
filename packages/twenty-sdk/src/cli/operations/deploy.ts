import fs from 'fs';

import { ApiService } from '@/cli/utilities/api/api-service';
import { ConfigService } from '@/cli/utilities/config/config-service';
import {
  isTokenExpiredMessage,
  promptForReauthentication,
} from '@/cli/utilities/auth/reauth-helper';
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

const formatAuthError = (apiUrl: string, remoteName: string): string => {
  return [
    `Your API key for remote "${remoteName}" is no longer valid`,
    '(the workspace may have been reset, or the key was revoked).',
    '',
    'Re-authenticate with:',
    `  twenty remote:add --as ${remoteName} --api-key <NEW_KEY>`,
    '',
    `Generate a new key at: ${apiUrl}/settings/developers`,
  ].join('\n');
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
    const errorMessage =
      typeof uploadResult.error === 'string' ? uploadResult.error : '';

    if (uploadResult.isAuthError || isTokenExpiredMessage(errorMessage)) {
      const remoteName = ConfigService.getActiveRemote();
      const configService = new ConfigService();
      const config = await configService.getConfigForRemote(remoteName);

      console.error(formatAuthError(config.apiUrl, remoteName));
      const outcome = await promptForReauthentication(remoteName);

      if (outcome === 'reauthenticated') {
        const retryResult = await apiService.uploadAppTarball({ tarballBuffer });

        if (retryResult.success) {
          return { success: true, data: retryResult.data };
        }
      }
    }

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
    data: uploadResult.data,
  };
};

export const appDeploy = (
  options: AppDeployOptions,
): Promise<CommandResult<AppDeployResult>> =>
  runSafe(() => innerAppDeploy(options), APP_ERROR_CODES.DEPLOY_FAILED);
