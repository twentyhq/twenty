import { execSync } from 'child_process';
import path from 'path';

import { buildApplication } from '@/cli/utilities/build/common/build-application';
import { synchronizeBuiltApplication } from '@/cli/utilities/build/common/synchronize-built-application';
import { buildAndValidateManifest } from '@/cli/utilities/build/manifest/build-and-validate-manifest';
import { runSafe } from '@/cli/utilities/run-safe';
import {
  appGenerateClient,
  type AppGenerateClientOptions,
} from './app-generate-client';
import { APP_ERROR_CODES, type CommandResult } from './types';

export type AppPackResult = {
  tarballPath: string;
};

const innerAppPack = async (
  options: AppGenerateClientOptions,
): Promise<CommandResult<AppPackResult>> => {
  const generateResult = await appGenerateClient(options);

  if (!generateResult.success) {
    return generateResult;
  }

  options.onProgress?.('Rebuilding with generated client...');

  const manifestResult = await buildAndValidateManifest(options.appPath);

  if (!manifestResult.success) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.MANIFEST_BUILD_FAILED,
        message: manifestResult.errors.join('\n'),
      },
    };
  }

  const finalBuildResult = await buildApplication({
    appPath: options.appPath,
    manifest: manifestResult.manifest,
    filePaths: manifestResult.filePaths,
  });

  options.onProgress?.('Syncing final build...');

  const finalSyncResult = await synchronizeBuiltApplication({
    appPath: options.appPath,
    manifest: manifestResult.manifest,
    builtFileInfos: finalBuildResult.builtFileInfos,
  });

  if (!finalSyncResult.success) {
    return finalSyncResult;
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
  options: AppGenerateClientOptions,
): Promise<CommandResult<AppPackResult>> =>
  runSafe(() => innerAppPack(options), APP_ERROR_CODES.SYNC_FAILED);
