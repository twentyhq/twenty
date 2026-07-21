import path from 'path';
import { type Manifest, OUTPUT_DIR } from 'twenty-shared/application';
import { type MetadataValidationErrorResponse } from 'twenty-shared/metadata';
import { isPlainObject } from 'twenty-shared/utils';

import { ApiService } from '@/cli/utilities/api/api-service';
import {
  ensureAppAccessTokenIsValidOrRefresh,
  ensureAppRegistration,
} from '@/cli/utilities/auth';
import { buildAppTokenPairFetcher } from '@/cli/utilities/auth/build-app-token-pair-fetcher';
import { promptForReauthentication } from '@/cli/utilities/auth/reauth-helper';
import { buildApplication } from '@/cli/utilities/build/common/build-application';
import { runTypecheck } from '@/cli/utilities/build/common/typecheck-plugin';
import { buildAndValidateManifest } from '@/cli/utilities/build/manifest/build-and-validate-manifest';
import { manifestUpdateChecksums } from '@/cli/utilities/build/manifest/manifest-update-checksums';
import { writeManifestToOutput } from '@/cli/utilities/build/manifest/manifest-writer';
import { ClientService } from '@/cli/utilities/client/client-service';
import { ConfigService } from '@/cli/utilities/config/config-service';
import {
  countDestructiveActions,
  formatSyncActionsPlan,
  hasDestructiveActions,
} from '@/cli/utilities/dev/orchestrator/steps/format-sync-actions-plan';
import { formatManifestValidationErrors } from '@/cli/utilities/error/format-manifest-validation-errors';
import { getSyncErrorRecoveryHint } from '@/cli/utilities/error/get-sync-error-recovery-hint';
import { serializeError } from '@/cli/utilities/error/serialize-error';
import { FileUploader } from '@/cli/utilities/file/file-uploader';
import { runSafe } from '@/cli/utilities/run-safe';
import {
  APP_ERROR_CODES,
  type CommandError,
  type CommandResult,
} from '@/cli/types';
import chalk from 'chalk';

export type AppDevOnceOptions = {
  appPath: string;
  verbose?: boolean;
  apply?: boolean;
  force?: boolean;
  onProgress?: (message: string) => void;
  onPlan?: (text: string) => void;
  confirmApply?: (deleteCount: number) => Promise<boolean>;
};

export type AppDevOnceResult = {
  outputDir: string;
  fileCount: number;
  applicationDisplayName: string;
  applicationUniversalIdentifier: string;
  applied: boolean;
};

const appendRecoveryHint = (
  message: string,
  errorMessage: string | undefined,
): string => {
  const hint = getSyncErrorRecoveryHint(errorMessage);

  return hint ? `${message}\n\n${hint}` : message;
};

const NOT_INSTALLED_SUB_CODES = new Set([
  'APP_NOT_INSTALLED',
  'APPLICATION_NOT_FOUND',
]);

const isAppNotInstalledError = (result: {
  error?: MetadataValidationErrorResponse;
  message?: string;
}): boolean => {
  const extensions = result.error;

  if (
    isPlainObject(extensions) &&
    NOT_INSTALLED_SUB_CODES.has(
      (extensions as { subCode?: string }).subCode ?? '',
    )
  ) {
    return true;
  }

  const message = (result.message ?? '').toLowerCase();

  return (
    message.includes('not installed in workspace') ||
    message.includes('not found in workspace')
  );
};

const buildSyncError = (
  result: { error?: MetadataValidationErrorResponse; message?: string },
  verbose: boolean,
): CommandError => {
  const errorEvents = verbose
    ? null
    : formatManifestValidationErrors(result.error);

  const message = errorEvents
    ? errorEvents.map((event) => event.message).join('\n')
    : `Sync failed with error: ${result.message ?? 'Unknown error'}`;

  return {
    code: APP_ERROR_CODES.SYNC_FAILED,
    message: appendRecoveryHint(message, result.message),
  };
};

const innerAppDevOnce = async (
  options: AppDevOnceOptions,
): Promise<CommandResult<AppDevOnceResult>> => {
  const {
    appPath,
    onProgress,
    onPlan,
    confirmApply,
    verbose = false,
    apply = true,
    force = false,
  } = options;

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
          '    yarn twenty docker:start\n\n' +
          '  Check server status:\n' +
          '    yarn twenty docker:status',
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
          code: APP_ERROR_CODES.SYNC_FAILED,
          message:
            'Authentication failed. Run `yarn twenty remote:add` to authenticate.',
        },
      };
    }
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
    onProgress?.(chalk.yellow(`⚠ ${warning}`));
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

  const makeData = (): AppDevOnceResult => ({
    outputDir: path.join(appPath, OUTPUT_DIR),
    fileCount: buildResult.builtFileInfos.size,
    applicationDisplayName: manifest.application.displayName,
    applicationUniversalIdentifier: manifest.application.universalIdentifier,
    applied: apply,
  });

  if (!apply) {
    onProgress?.(
      'Computing metadata plan (read-only, nothing will be applied)...',
    );

    const planResult = await apiService.syncApplication(manifest, {
      dryRun: true,
    });

    if (!planResult.success) {
      return { success: false, error: buildSyncError(planResult, verbose) };
    }

    onPlan?.(formatSyncActionsPlan(planResult.data.actions));

    return { success: true, data: makeData() };
  }

  let planRendered = false;

  if (!force) {
    onProgress?.('Computing metadata plan...');

    const planResult = await apiService.syncApplication(manifest, {
      dryRun: true,
    });

    if (planResult.success) {
      onPlan?.(formatSyncActionsPlan(planResult.data.actions));
      planRendered = true;

      if (hasDestructiveActions(planResult.data.actions)) {
        const approved = confirmApply
          ? await confirmApply(countDestructiveActions(planResult.data.actions))
          : false;

        if (!approved) {
          return {
            success: false,
            error: {
              code: APP_ERROR_CODES.APPLY_ABORTED,
              message: 'Apply cancelled — no changes were made.',
            },
          };
        }
      }
    } else if (!isAppNotInstalledError(planResult)) {
      return { success: false, error: buildSyncError(planResult, verbose) };
    }
  }

  onProgress?.('Registering application...');

  const configService = new ConfigService();

  const { clientId, clientSecret } = await ensureAppRegistration(
    apiService,
    configService,
    {
      name: manifest.application.displayName,
      universalIdentifier: manifest.application.universalIdentifier,
    },
  );

  const createDevAppResult = await apiService.createDevelopmentApplication({
    universalIdentifier: manifest.application.universalIdentifier,
    name: manifest.application.displayName,
  });

  if (!createDevAppResult.success) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.SYNC_FAILED,
        message: `Failed to install development application: ${serializeError(createDevAppResult.error)}`,
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
    return { success: false, error: buildSyncError(syncResult, verbose) };
  }

  if (!planRendered) {
    onPlan?.(formatSyncActionsPlan(syncResult.data.actions));
  }

  onProgress?.('Generating API client...');

  try {
    const appAccessToken = await ensureAppAccessTokenIsValidOrRefresh(
      configService,
      {
        credentials: clientSecret ? { clientId, clientSecret } : undefined,
        fetchTokenPair: buildAppTokenPairFetcher(
          apiService,
          createDevAppResult.data.id,
        ),
      },
    );

    const clientService = new ClientService();

    await clientService.generateCoreClient({
      appPath,
      appAccessToken,
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

  return { success: true, data: makeData() };
};

export const appDevOnce = (
  options: AppDevOnceOptions,
): Promise<CommandResult<AppDevOnceResult>> =>
  runSafe(() => innerAppDevOnce(options), APP_ERROR_CODES.SYNC_FAILED);
