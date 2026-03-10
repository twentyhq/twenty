import { execSync } from 'child_process';
import fs from 'fs';

import { ApiService } from '@/cli/utilities/api/api-service';
import { runSafe } from '@/cli/utilities/run-safe';
import { appBuild } from './app-build';
import { APP_ERROR_CODES, type CommandResult } from './types';

export type AppPublishOptions = {
  appPath: string;
  server?: string;
  token?: string;
  npmTag?: string;
  onProgress?: (message: string) => void;
};

export type AppPublishResult = {
  target: 'npm' | 'server';
  universalIdentifier?: string;
};

const innerAppPublish = async (
  options: AppPublishOptions,
): Promise<CommandResult<AppPublishResult>> => {
  const { appPath, onProgress } = options;
  const isServerPublish = !!options.server;

  const buildResult = await appBuild({
    appPath,
    tarball: isServerPublish,
    onProgress,
  });

  if (!buildResult.success) {
    return buildResult;
  }

  if (isServerPublish) {
    return publishToServer({
      tarballPath: buildResult.data.tarballPath!,
      server: options.server!,
      token: options.token,
      onProgress,
    });
  }

  return publishToNpm({
    outputDir: buildResult.data.outputDir,
    npmTag: options.npmTag,
    onProgress,
  });
};

const publishToNpm = async ({
  outputDir,
  npmTag,
  onProgress,
}: {
  outputDir: string;
  npmTag?: string;
  onProgress?: (message: string) => void;
}): Promise<CommandResult<AppPublishResult>> => {
  onProgress?.('Publishing to npm...');

  const tagArg = npmTag ? ` --tag ${npmTag}` : '';

  try {
    execSync(`npm publish${tagArg}`, {
      cwd: outputDir,
      stdio: 'inherit',
    });
  } catch {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.PUBLISH_FAILED,
        message:
          'npm publish failed. Make sure you are logged in (`npm login`) and the package name is available.',
      },
    };
  }

  return { success: true, data: { target: 'npm' } };
};

const publishToServer = async ({
  tarballPath,
  server,
  token,
  onProgress,
}: {
  tarballPath: string;
  server: string;
  token?: string;
  onProgress?: (message: string) => void;
}): Promise<CommandResult<AppPublishResult>> => {
  onProgress?.(`Uploading ${tarballPath}...`);

  const tarballBuffer = fs.readFileSync(tarballPath);

  const apiService = new ApiService({
    serverUrl: server,
    token,
  });

  const uploadResult = await apiService.uploadAppTarball({ tarballBuffer });

  if (!uploadResult.success) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.PUBLISH_FAILED,
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
        code: APP_ERROR_CODES.PUBLISH_FAILED,
        message: `Install failed: ${installResult.error}`,
      },
    };
  }

  return {
    success: true,
    data: {
      target: 'server',
      universalIdentifier: uploadResult.data.universalIdentifier,
    },
  };
};

export const appPublish = (
  options: AppPublishOptions,
): Promise<CommandResult<AppPublishResult>> =>
  runSafe(() => innerAppPublish(options), APP_ERROR_CODES.PUBLISH_FAILED);
