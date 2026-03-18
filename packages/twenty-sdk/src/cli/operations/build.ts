import { execSync } from 'child_process';
import path from 'path';

import { buildApplication } from '@/cli/utilities/build/common/build-application';
import { synchronizeBuiltApplication } from '@/cli/utilities/build/common/synchronize-built-application';
import { runTypecheck } from '@/cli/utilities/build/common/typecheck-plugin';
import { buildAndValidateManifest } from '@/cli/utilities/build/manifest/build-and-validate-manifest';
import { ClientService } from '@/cli/utilities/client/client-service';
import { runSafe } from '@/cli/utilities/run-safe';
import { APP_ERROR_CODES, type CommandResult } from '@/cli/types';

export type AppBuildOptions = {
  appPath: string;
  tarball?: boolean;
  onProgress?: (message: string) => void;
};

export type AppBuildResult = {
  outputDir: string;
  fileCount: number;
  tarballPath?: string;
};

const innerAppBuild = async (
  options: AppBuildOptions,
): Promise<CommandResult<AppBuildResult>> => {
  const { appPath, onProgress } = options;

  onProgress?.('Building manifest...');

  const manifestResult = await buildAndValidateManifest(appPath);

  if (!manifestResult.success) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.MANIFEST_BUILD_FAILED,
        message: manifestResult.errors.join('\n'),
      },
    };
  }

  const { manifest, filePaths } = manifestResult;

  for (const warning of manifestResult.warnings) {
    onProgress?.(`⚠ ${warning}`);
  }

  onProgress?.('Building application files...');

  const firstBuildResult = await buildApplication({
    appPath,
    manifest,
    filePaths,
  });

  onProgress?.('Syncing application schema...');

  const firstSyncResult = await synchronizeBuiltApplication({
    appPath,
    manifest,
    builtFileInfos: firstBuildResult.builtFileInfos,
  });

  if (!firstSyncResult.success) {
    return firstSyncResult;
  }

  onProgress?.('Generating API client...');

  const clientService = new ClientService();

  await clientService.generateCoreClient({ appPath });

  onProgress?.('Running typecheck...');

  const typecheckErrors = await runTypecheck(appPath);

  if (typecheckErrors.length > 0) {
    const errorMessages = typecheckErrors.map(
      (error) =>
        `${error.file}(${error.line},${error.column + 1}): ${error.text}`,
    );

    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.TYPECHECK_FAILED,
        message: `Typecheck failed:\n${errorMessages.join('\n')}`,
      },
    };
  }

  onProgress?.('Rebuilding with generated client...');

  const finalBuildResult = await buildApplication({
    appPath,
    manifest,
    filePaths,
  });

  onProgress?.('Syncing built files...');

  const finalSyncResult = await synchronizeBuiltApplication({
    appPath,
    manifest,
    builtFileInfos: finalBuildResult.builtFileInfos,
  });

  if (!finalSyncResult.success) {
    return finalSyncResult;
  }

  const outputDir = path.join(appPath, '.twenty', 'output');

  const result: AppBuildResult = {
    outputDir,
    fileCount: finalBuildResult.builtFileInfos.size,
  };

  if (options.tarball) {
    onProgress?.('Packing tarball...');

    const packOutput = execSync('npm pack --pack-destination .', {
      cwd: outputDir,
      encoding: 'utf-8',
    }).trim();

    const tarballName = packOutput.split('\n').pop()!;

    result.tarballPath = path.join(outputDir, tarballName);
  }

  return { success: true, data: result };
};

export const appBuild = (
  options: AppBuildOptions,
): Promise<CommandResult<AppBuildResult>> =>
  runSafe(() => innerAppBuild(options), APP_ERROR_CODES.BUILD_FAILED);
