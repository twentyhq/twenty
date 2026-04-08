import path from 'path';
import { OUTPUT_DIR, type Manifest } from 'twenty-shared/application';

import { ApiService } from '@/cli/utilities/api/api-service';
import { buildApplication } from '@/cli/utilities/build/common/build-application';
import { runTypecheck } from '@/cli/utilities/build/common/typecheck-plugin';
import { buildAndValidateManifest } from '@/cli/utilities/build/manifest/build-and-validate-manifest';
import { manifestUpdateChecksums } from '@/cli/utilities/build/manifest/manifest-update-checksums';
import { writeManifestToOutput } from '@/cli/utilities/build/manifest/manifest-writer';
import { ClientService } from '@/cli/utilities/client/client-service';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { formatSyncErrorEvents } from '@/cli/utilities/dev/orchestrator/steps/format-sync-error-events';
import { serializeError } from '@/cli/utilities/error/serialize-error';
import { FileUploader } from '@/cli/utilities/file/file-uploader';
import { runSafe } from '@/cli/utilities/run-safe';
import { APP_ERROR_CODES, type CommandResult } from '@/cli/types';

export type AppDevOnceOptions = {
  appPath: string;
  verbose?: boolean;
  onProgress?: (message: string) => void;
};

export type AppDevOnceResult = {
  outputDir: string;
  fileCount: number;
  applicationDisplayName: string;
  applicationUniversalIdentifier: string;
};

const innerAppDevOnce = async (
  options: AppDevOnceOptions,
): Promise<CommandResult<AppDevOnceResult>> => {
  const { appPath, onProgress, verbose } = options;

  onProgress?.('Checking server...');

  const apiService = new ApiService({ disableInterceptors: true });
  const validateAuth = await apiService.validateAuth();

  if (!validateAuth.serverUp) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.SYNC_FAILED,
        message:
          'Cannot reach Twenty server.\n\n' +
          '  Start a local server:\n' +
          '    yarn twenty server start\n\n' +
          '  Check server status:\n' +
          '    yarn twenty server status',
      },
    };
  }

  if (!validateAuth.authValid) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.SYNC_FAILED,
        message:
          'Authentication failed. Run `yarn twenty remote add --local` to authenticate.',
      },
    };
  }

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

  for (const warning of manifestResult.warnings) {
    onProgress?.(`⚠ ${warning}`);
  }

  onProgress?.('Building application files...');

  const buildResult = await buildApplication({
    appPath,
    manifest: manifestResult.manifest,
    filePaths: manifestResult.filePaths,
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

  const manifest: Manifest = manifestUpdateChecksums({
    manifest: manifestResult.manifest,
    builtFileInfos: buildResult.builtFileInfos,
  });

  await writeManifestToOutput(appPath, manifest);

  onProgress?.('Registering application...');

  const configService = new ConfigService();
  const registrationResult =
    await apiService.findApplicationRegistrationByUniversalIdentifier(
      manifest.application.universalIdentifier,
    );

  if (!registrationResult.success) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.SYNC_FAILED,
        message: `Failed to check app registration: ${serializeError(registrationResult.error)}`,
      },
    };
  }

  if (!registrationResult.data) {
    const createRegistrationResult =
      await apiService.createApplicationRegistration({
        name: manifest.application.displayName,
        universalIdentifier: manifest.application.universalIdentifier,
      });

    if (!createRegistrationResult.success) {
      return {
        success: false,
        error: {
          code: APP_ERROR_CODES.SYNC_FAILED,
          message: `Failed to create app registration: ${serializeError(createRegistrationResult.error)}`,
        },
      };
    }

    await configService.setConfig({
      oauthClientId:
        createRegistrationResult.data.applicationRegistration.oAuthClientId,
    });
  }

  const createDevAppResult = await apiService.createDevelopmentApplication({
    universalIdentifier: manifest.application.universalIdentifier,
    name: manifest.application.displayName,
  });

  if (!createDevAppResult.success) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.SYNC_FAILED,
        message: `Failed to create development application: ${serializeError(createDevAppResult.error)}`,
      },
    };
  }

  onProgress?.(
    `Uploading ${buildResult.builtFileInfos.size} file${buildResult.builtFileInfos.size === 1 ? '' : 's'}...`,
  );

  const fileUploader = new FileUploader({
    appPath,
    applicationUniversalIdentifier: manifest.application.universalIdentifier,
  });

  const uploadErrors: string[] = [];

  const uploadPromises = Array.from(buildResult.builtFileInfos.values()).map(
    async (builtFileInfo) => {
      if (verbose) {
        onProgress?.(`Uploading ${builtFileInfo.builtPath}`);
      }

      const result = await fileUploader.uploadFile({
        builtPath: builtFileInfo.builtPath,
        fileFolder: builtFileInfo.fileFolder,
      });

      if (!result.success) {
        uploadErrors.push(
          `Failed to upload ${builtFileInfo.builtPath}: ${serializeError(result.error)}`,
        );
      }
    },
  );

  await Promise.all(uploadPromises);

  if (uploadErrors.length > 0) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.SYNC_FAILED,
        message: uploadErrors.join('\n'),
      },
    };
  }

  onProgress?.('Syncing manifest...');

  const syncResult = await apiService.syncApplication(manifest);

  if (!syncResult.success) {
    const errorEvents = verbose
      ? null
      : formatSyncErrorEvents(syncResult.error);

    const message = errorEvents
      ? errorEvents.map((event) => event.message).join('\n')
      : `Sync failed with error: ${serializeError(syncResult.error)}`;

    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.SYNC_FAILED,
        message,
      },
    };
  }

  onProgress?.('Generating API client...');

  try {
    const config = await configService.getConfig();
    const clientService = new ClientService();

    await clientService.generateCoreClient({
      appPath,
      authToken: config.accessToken,
    });
  } catch (error) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.SYNC_FAILED,
        message: `Failed to generate API client: ${serializeError(error)}`,
      },
    };
  }

  return {
    success: true,
    data: {
      outputDir: path.join(appPath, OUTPUT_DIR),
      fileCount: buildResult.builtFileInfos.size,
      applicationDisplayName: manifest.application.displayName,
      applicationUniversalIdentifier: manifest.application.universalIdentifier,
    },
  };
};

export const appDevOnce = (
  options: AppDevOnceOptions,
): Promise<CommandResult<AppDevOnceResult>> =>
  runSafe(() => innerAppDevOnce(options), APP_ERROR_CODES.SYNC_FAILED);
