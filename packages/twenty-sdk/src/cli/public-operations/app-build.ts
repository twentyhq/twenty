import { buildApplication } from '@/cli/utilities/build/common/build-application';
import { synchronizeBuiltApplication } from '@/cli/utilities/build/common/synchronize-built-application';
import { runTypecheck } from '@/cli/utilities/build/common/typecheck-plugin';
import { buildAndValidateManifest } from '@/cli/utilities/build/manifest/build-and-validate-manifest';
import { ClientService } from '@/cli/utilities/client/client-service';
import { APP_ERROR_CODES, type CommandResult } from './types';

export type AppBuildOptions = {
  appPath: string;
  onProgress?: (message: string) => void;
};

export type AppBuildResult = {
  fileCount: number;
};

export const appBuild = async (
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
  const clientService = new ClientService();

  await clientService.ensureGeneratedClientStub({ appPath });

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

  await clientService.generate({ appPath });

  onProgress?.('Running typecheck...');

  const typecheckErrors = await runTypecheck(appPath);

  if (typecheckErrors.length > 0) {
    const errorMessages = typecheckErrors.map(
      (error) => `${error.file}(${error.line},${error.column}): ${error.text}`,
    );

    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.SYNC_FAILED,
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

  return {
    success: true,
    data: {
      fileCount: finalBuildResult.builtFileInfos.size,
    },
  };
};
