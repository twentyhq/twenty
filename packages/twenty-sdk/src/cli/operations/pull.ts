import { readdir } from 'node:fs/promises';
import path from 'path';

import { type Manifest, OUTPUT_DIR } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ApiService } from '@/cli/utilities/api/api-service';
import { promptForReauthentication } from '@/cli/utilities/auth/reauth-helper';
import { writeManifestToOutput } from '@/cli/utilities/build/manifest/manifest-writer';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { serializeError } from '@/cli/utilities/error/serialize-error';
import { pathExists, readJson } from '@/cli/utilities/file/fs-utils';
import { writeManifestSourceFiles } from '@/cli/utilities/pull/write-manifest-source-files';
import { APP_ERROR_CODES, type CommandResult } from '@/cli/types';

export type AppPullOptions = {
  appPath: string;
  universalIdentifier?: string;
  force?: boolean;
  confirmOverwrite?: () => Promise<boolean>;
  onProgress?: (message: string) => void;
};

export type AppPullResult = {
  applicationUniversalIdentifier: string;
  applicationDisplayName: string;
  outputDir: string;
  writtenFiles: string[];
  objectCount: number;
  isProjectScaffolded: boolean;
};

const isExistingTwentyAppDirectory = async (
  appPath: string,
): Promise<boolean> => {
  const srcPath = path.join(appPath, 'src');

  if (await pathExists(srcPath)) {
    const entries = await readdir(srcPath);

    if (entries.length > 0) {
      return true;
    }
  }

  return pathExists(path.join(appPath, OUTPUT_DIR));
};

const resolveUniversalIdentifier = async ({
  appPath,
  universalIdentifier,
}: {
  appPath: string;
  universalIdentifier?: string;
}): Promise<string | null> => {
  if (isDefined(universalIdentifier)) {
    return universalIdentifier;
  }

  const localManifestPath = path.join(appPath, OUTPUT_DIR, 'manifest.json');

  if (await pathExists(localManifestPath)) {
    const localManifest = await readJson<Manifest>(localManifestPath);

    return localManifest.application?.universalIdentifier ?? null;
  }

  return null;
};

export const appPull = async (
  options: AppPullOptions,
): Promise<CommandResult<AppPullResult>> => {
  const {
    appPath,
    universalIdentifier: universalIdentifierOption,
    force = false,
    confirmOverwrite,
    onProgress,
  } = options;

  try {
    onProgress?.('Checking server...');

    const apiService = new ApiService({ disableInterceptors: true });
    const validateAuth = await apiService.validateAuth();

    if (!validateAuth.serverUp) {
      return {
        success: false,
        error: {
          code: APP_ERROR_CODES.PULL_FAILED,
          message:
            'Cannot reach Twenty server.\n\n' +
            '  Start a local server:\n' +
            '    yarn twenty docker:start',
        },
      };
    }

    if (!validateAuth.authValid) {
      const outcome = await promptForReauthentication(
        ConfigService.getActiveRemote(),
      );

      if (outcome !== 'reauthenticated') {
        return {
          success: false,
          error: {
            code: APP_ERROR_CODES.PULL_FAILED,
            message:
              'Authentication failed. Run `yarn twenty remote:add` to authenticate.',
          },
        };
      }
    }

    const universalIdentifier = await resolveUniversalIdentifier({
      appPath,
      universalIdentifier: universalIdentifierOption,
    });

    if (!isDefined(universalIdentifier)) {
      return {
        success: false,
        error: {
          code: APP_ERROR_CODES.PULL_FAILED,
          message:
            'No application to pull. Pass `--universal-identifier <id>` or run inside a previously built app.',
        },
      };
    }

    if (!force && (await isExistingTwentyAppDirectory(appPath))) {
      const approved = confirmOverwrite ? await confirmOverwrite() : false;

      if (!approved) {
        return {
          success: false,
          error: {
            code: APP_ERROR_CODES.PULL_ABORTED,
            message: 'Pull cancelled — no files were written.',
          },
        };
      }
    }

    onProgress?.(`Fetching application ${universalIdentifier}...`);

    const result = await apiService.exportApplication(universalIdentifier);

    if (!result.success) {
      return {
        success: false,
        error: {
          code: APP_ERROR_CODES.PULL_FAILED,
          message: result.message ?? 'Failed to export application.',
        },
      };
    }

    const { manifest } = result.data;

    const isProjectScaffolded = await pathExists(
      path.join(appPath, 'package.json'),
    );

    onProgress?.('Writing source files...');

    const writtenFiles = await writeManifestSourceFiles({
      outPath: appPath,
      manifest,
    });

    await writeManifestToOutput(appPath, manifest);

    return {
      success: true,
      data: {
        applicationUniversalIdentifier:
          result.data.applicationUniversalIdentifier,
        applicationDisplayName: manifest.application.displayName,
        outputDir: path.join(appPath, OUTPUT_DIR),
        writtenFiles,
        objectCount: manifest.objects.length,
        isProjectScaffolded,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.PULL_FAILED,
        message: serializeError(error),
      },
    };
  }
};
