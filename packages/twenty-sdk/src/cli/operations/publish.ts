import { execSync } from 'child_process';

import { runSafe } from '@/cli/utilities/run-safe';
import { appBuild } from './build';
import { APP_ERROR_CODES, type CommandResult } from '@/cli/types';

export type AppPublishOptions = {
  appPath: string;
  npmTag?: string;
  onProgress?: (message: string) => void;
};

export type AppPublishResult = {
  target: 'npm';
};

const innerAppPublish = async (
  options: AppPublishOptions,
): Promise<CommandResult<AppPublishResult>> => {
  const { appPath, onProgress } = options;

  const buildResult = await appBuild({
    appPath,
    onProgress,
  });

  if (!buildResult.success) {
    return buildResult;
  }

  onProgress?.('Publishing to npm...');

  const tagArg = options.npmTag ? ` --tag ${options.npmTag}` : '';

  try {
    execSync(`npm publish${tagArg}`, {
      cwd: buildResult.data.outputDir,
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

export const appPublish = (
  options: AppPublishOptions,
): Promise<CommandResult<AppPublishResult>> =>
  runSafe(() => innerAppPublish(options), APP_ERROR_CODES.PUBLISH_FAILED);
