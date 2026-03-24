import { execSync } from 'child_process';
import path from 'path';

import { buildApplication } from '@/cli/utilities/build/common/build-application';
import { runTypecheck } from '@/cli/utilities/build/common/typecheck-plugin';
import { buildAndValidateManifest } from '@/cli/utilities/build/manifest/build-and-validate-manifest';
import { manifestUpdateChecksums } from '@/cli/utilities/build/manifest/manifest-update-checksums';
import { writeManifestToOutput } from '@/cli/utilities/build/manifest/manifest-writer';
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

  const buildResult = await buildApplication({
    appPath,
    manifest,
    filePaths,
  });

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

  const updatedManifest = manifestUpdateChecksums({
    manifest,
    builtFileInfos: buildResult.builtFileInfos,
  });

  await writeManifestToOutput(appPath, updatedManifest);

  const outputDir = path.join(appPath, '.twenty', 'output');

  const result: AppBuildResult = {
    outputDir,
    fileCount: buildResult.builtFileInfos.size,
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
