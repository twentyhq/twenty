import { execFileSync } from 'child_process';

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

  if (options.npmTag && !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(options.npmTag)) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.PUBLISH_FAILED,
        message: `Invalid npm tag: ${options.npmTag}`,
      },
    };
  }

  const publishArgs = [
    'publish',
    ...(options.npmTag ? ['--tag', options.npmTag] : []),
  ];

  const isWindows = process.platform === 'win32';

  try {
    execFileSync(isWindows ? 'npm.cmd' : 'npm', publishArgs, {
      cwd: buildResult.data.outputDir,
      stdio: 'inherit',
      shell: isWindows,
    });
  } catch {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.PUBLISH_FAILED,
        message: `npm publish failed`,
      },
    };
  }

  return { success: true, data: { target: 'npm' } };
};

export const appPublish = (
  options: AppPublishOptions,
): Promise<CommandResult<AppPublishResult>> =>
  runSafe(() => innerAppPublish(options), APP_ERROR_CODES.PUBLISH_FAILED);
