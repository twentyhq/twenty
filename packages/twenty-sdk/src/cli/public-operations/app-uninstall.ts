import { ApiService } from '@/cli/utilities/api/api-service';
import { readManifestFromFile } from '@/cli/utilities/build/manifest/manifest-reader';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { runSafe } from '@/cli/utilities/run-safe';
import { APP_ERROR_CODES, type CommandResult } from './types';

export type AppUninstallOptions = {
  appPath: string;
  workspace?: string;
};

const innerAppUninstall = async (
  options: AppUninstallOptions,
): Promise<CommandResult> => {
  if (options.workspace) {
    ConfigService.setActiveWorkspace(options.workspace);
  }

  const apiService = new ApiService();
  const manifest = await readManifestFromFile(options.appPath);

  if (!manifest) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.MANIFEST_NOT_FOUND,
        message: 'Manifest not found. Run `app:build` or `app:dev` first.',
      },
    };
  }

  const result = await apiService.uninstallApplication(
    manifest.application.universalIdentifier,
  );

  if (!result.success) {
    const errorMessage =
      result.error instanceof Error
        ? result.error.message
        : String(result.error ?? 'Unknown error');

    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.UNINSTALL_FAILED,
        message: errorMessage,
      },
    };
  }

  return { success: true, data: undefined };
};

export const appUninstall = (
  options: AppUninstallOptions,
): Promise<CommandResult> =>
  runSafe(() => innerAppUninstall(options), APP_ERROR_CODES.UNINSTALL_FAILED);
