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

  // Provenance can only be generated from a CI with OIDC; forcing it locally
  // makes npm publish fail. ACTIONS_ID_TOKEN_REQUEST_URL is only set when the
  // GitHub Actions workflow grants id-token: write.
  // npm rejects provenance when the workflow runs from a private source repo
  // (E422 "Unsupported GitHub Actions source repository visibility: private").
  // Set TWENTY_APP_PUBLISH_DISABLE_PROVENANCE=true to opt out in that case.
  const provenanceDisabled =
    process.env.TWENTY_APP_PUBLISH_DISABLE_PROVENANCE === 'true';
  const supportsProvenance =
    process.env.ACTIONS_ID_TOKEN_REQUEST_URL != null && !provenanceDisabled;

  const publishArgs = [
    'publish',
    '--access',
    'public',
    ...(supportsProvenance ? ['--provenance'] : []),
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
