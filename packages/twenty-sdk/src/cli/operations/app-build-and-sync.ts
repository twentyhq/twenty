import { buildAndValidateManifest } from '@/cli/utilities/build/manifest/build-and-validate-manifest';
import { runTypecheck } from '@/cli/utilities/build/common/typecheck-plugin';
import { ClientService } from '@/cli/utilities/client/client-service';
import { appBuild } from './app-build';
import { syncBuiltApp } from './app-sync';
import { APP_ERROR_CODES, type CommandResult } from './types';

export const APP_BUILD_AND_SYNC_STEPS = {
  MANIFEST: 'manifest',
  BUILD: 'build',
  SYNC_SCHEMA: 'sync_schema',
  GENERATE_CLIENT: 'generate_client',
  TYPECHECK: 'typecheck',
  REBUILD: 'rebuild',
  SYNC_FINAL: 'sync_final',
} as const;

export type AppBuildAndSyncStep =
  (typeof APP_BUILD_AND_SYNC_STEPS)[keyof typeof APP_BUILD_AND_SYNC_STEPS];

export type AppBuildAndSyncOptions = {
  appPath: string;
  onStep?: (step: AppBuildAndSyncStep) => void;
};

export type AppBuildAndSyncResult = {
  fileCount: number;
};

export const appBuildAndSync = async (
  options: AppBuildAndSyncOptions,
): Promise<CommandResult<AppBuildAndSyncResult>> => {
  const { appPath, onStep } = options;

  onStep?.(APP_BUILD_AND_SYNC_STEPS.MANIFEST);

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
  const clientService = new ClientService();

  await clientService.ensureGeneratedClientStub({ appPath });

  onStep?.(APP_BUILD_AND_SYNC_STEPS.BUILD);

  const firstBuildResult = await appBuild({
    appPath,
    manifest,
    filePaths,
  });

  onStep?.(APP_BUILD_AND_SYNC_STEPS.SYNC_SCHEMA);

  const firstSyncResult = await syncBuiltApp({
    appPath,
    manifest,
    builtFileInfos: firstBuildResult.builtFileInfos,
  });

  if (!firstSyncResult.success) {
    return firstSyncResult;
  }

  onStep?.(APP_BUILD_AND_SYNC_STEPS.GENERATE_CLIENT);

  await clientService.generate({ appPath });

  onStep?.(APP_BUILD_AND_SYNC_STEPS.TYPECHECK);

  const typecheckErrors = await runTypecheck(appPath);

  if (typecheckErrors.length > 0) {
    const errorMessages = typecheckErrors.map(
      (error) =>
        `${error.file}(${error.line},${error.column}): ${error.text}`,
    );

    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.SYNC_FAILED,
        message: `Typecheck failed:\n${errorMessages.join('\n')}`,
      },
    };
  }

  onStep?.(APP_BUILD_AND_SYNC_STEPS.REBUILD);

  const finalBuildResult = await appBuild({
    appPath,
    manifest,
    filePaths,
  });

  onStep?.(APP_BUILD_AND_SYNC_STEPS.SYNC_FINAL);

  const finalSyncResult = await syncBuiltApp({
    appPath,
    manifest,
    builtFileInfos: finalBuildResult.builtFileInfos,
  });

  if (!finalSyncResult.success) {
    return finalSyncResult;
  }

  return {
    success: true,
    data: {
      fileCount: finalBuildResult.builtFileInfos.size,
    },
  };
};
