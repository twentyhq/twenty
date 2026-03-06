import { buildApplication } from '@/cli/utilities/build/common/build-application';
import { synchronizeBuiltApplication } from '@/cli/utilities/build/common/synchronize-built-application';
import { runTypecheck } from '@/cli/utilities/build/common/typecheck-plugin';
import { buildAndValidateManifest } from '@/cli/utilities/build/manifest/build-and-validate-manifest';
import { ClientService } from '@/cli/utilities/client/client-service';
import { runSafe } from '@/cli/utilities/run-safe';
import { APP_ERROR_CODES, type CommandResult } from './types';

export type AppGenerateClientOptions = {
  appPath: string;
  onProgress?: (message: string) => void;
};

export type AppGenerateClientResult = {
  fileCount: number;
};

const innerAppGenerateClient = async (
  options: AppGenerateClientOptions,
): Promise<CommandResult<AppGenerateClientResult>> => {
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
  const clientService = new ClientService();

  await clientService.ensureGeneratedClientStub({ appPath });

  onProgress?.('Building application files...');

  const buildResult = await buildApplication({
    appPath,
    manifest,
    filePaths,
  });

  onProgress?.('Syncing application schema...');

  const syncResult = await synchronizeBuiltApplication({
    appPath,
    manifest,
    builtFileInfos: buildResult.builtFileInfos,
  });

  if (!syncResult.success) {
    return syncResult;
  }

  onProgress?.('Generating API client...');

  await clientService.generate({ appPath });

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

  return {
    success: true,
    data: {
      fileCount: buildResult.builtFileInfos.size,
    },
  };
};

export const appGenerateClient = (
  options: AppGenerateClientOptions,
): Promise<CommandResult<AppGenerateClientResult>> =>
  runSafe(() => innerAppGenerateClient(options), APP_ERROR_CODES.SYNC_FAILED);
