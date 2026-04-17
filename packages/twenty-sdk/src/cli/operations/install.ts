import { ApiService } from '@/cli/utilities/api/api-service';
import { readManifestFromFile } from '@/cli/utilities/build/manifest/manifest-reader';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { runSafe } from '@/cli/utilities/run-safe';
import { APP_ERROR_CODES, type CommandResult } from '@/cli/types';

export type AppInstallOptions = {
  appPath: string;
  remote?: string;
};

const innerAppInstall = async (
  options: AppInstallOptions,
): Promise<CommandResult> => {
  if (options.remote) {
    ConfigService.setActiveRemote(options.remote);
  }

  const apiService = new ApiService();
  const manifest = await readManifestFromFile(options.appPath);

  if (!manifest) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.MANIFEST_NOT_FOUND,
        message: 'Manifest not found. Run `build` or `dev` first.',
      },
    };
  }

  const result = await apiService.installTarballApp({
    universalIdentifier: manifest.application.universalIdentifier,
  });

  if (!result.success) {
    const rawError = result.error;
    const errorMessage =
      rawError instanceof Error
        ? rawError.message
        : typeof rawError === 'object' &&
            rawError !== null &&
            'message' in rawError
          ? String((rawError as { message: string }).message)
          : String(rawError ?? 'Unknown error');

    const extensions =
      typeof rawError === 'object' &&
      rawError !== null &&
      'extensions' in rawError
        ? (rawError as { extensions: Record<string, unknown> }).extensions
        : undefined;

    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.INSTALL_FAILED,
        message: errorMessage,
        ...(extensions ? { details: extensions } : {}),
      },
    };
  }

  return { success: true, data: undefined };
};

export const appInstall = (
  options: AppInstallOptions,
): Promise<CommandResult> =>
  runSafe(() => innerAppInstall(options), APP_ERROR_CODES.INSTALL_FAILED);
