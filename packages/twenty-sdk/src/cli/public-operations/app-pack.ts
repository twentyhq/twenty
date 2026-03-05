import { execSync } from 'child_process';
import path from 'path';

import { appBuild, type AppBuildOptions } from './app-build';
import { runSafe } from '@/cli/utilities/run-safe';
import { APP_ERROR_CODES, type CommandResult } from './types';

export type AppPackResult = {
  tarballPath: string;
};

const innerAppPack = async (
  options: AppBuildOptions,
): Promise<CommandResult<AppPackResult>> => {
  const buildResult = await appBuild(options);

  if (!buildResult.success) {
    return buildResult;
  }

  options.onProgress?.('Packing tarball...');

  const outputDir = path.join(options.appPath, '.twenty', 'output');

  const packOutput = execSync('npm pack --pack-destination .', {
    cwd: outputDir,
    encoding: 'utf-8',
  }).trim();

  const tarballName = packOutput.split('\n').pop()!;
  const tarballPath = path.join(outputDir, tarballName);

  return { success: true, data: { tarballPath } };
};

export const appPack = (
  options: AppBuildOptions,
): Promise<CommandResult<AppPackResult>> =>
  runSafe(() => innerAppPack(options), APP_ERROR_CODES.SYNC_FAILED);
