import { APP_ERROR_CODES, type CommandResult } from '@/cli/types';
import { ApiService } from '@/cli/utilities/api/api-service';
import { promptForReauthentication } from '@/cli/utilities/auth/reauth-helper';
import { ManifestEntityKey } from '@/cli/utilities/build/manifest/manifest-extract-config';
import { ConfigService } from '@/cli/utilities/config/config-service';
import {
  getGraphQLErrorMessage,
  hasGraphQLErrorSubCode,
} from '@/cli/utilities/error/parse-server-error';
import { pathExists } from '@/cli/utilities/file/fs-utils';
import { type ApplicationExportCoverageEntry } from '@/cli/utilities/pull/application-export-type';
import { applyPullWrites } from '@/cli/utilities/pull/apply-pull-writes';
import { type SkippedPullEntity } from '@/cli/utilities/pull/build-pull-entities';
import {
  planPullWrites,
  type PullDeletion,
  type PullWrite,
} from '@/cli/utilities/pull/plan-pull-writes';
import {
  readPullBaseManifest,
  writePullBaseManifest,
} from '@/cli/utilities/pull/pull-base-file';
import { scanProjectDefineFiles } from '@/cli/utilities/pull/scan-project-define-files';
import { runSafe } from '@/cli/utilities/run-safe';
import { join } from 'node:path';
import { isDefined } from 'twenty-shared/utils';

export type AppPullOptions = {
  appPath: string;
  universalIdentifier?: string;
  onProgress?: (message: string) => void;
};

export type AppPullResult = {
  applicationDisplayName: string;
  applicationUniversalIdentifier: string;
  writes: PullWrite[];
  deletions: PullDeletion[];
  unchangedCount: number;
  localOnlyRelativePaths: string[];
  skipped: SkippedPullEntity[];
  coverage: ApplicationExportCoverageEntry[];
  hadBase: boolean;
};

const EXPORT_REFUSAL_SUB_CODES = [
  'APPLICATION_NOT_EXPORTABLE',
  'STANDARD_APPLICATION_NOT_EXPORTABLE',
  'APPLICATION_NOT_FOUND',
];

const innerAppPull = async (
  options: AppPullOptions,
): Promise<CommandResult<AppPullResult>> => {
  const { appPath, onProgress } = options;

  if (!(await pathExists(join(appPath, 'package.json')))) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.PULL_FAILED,
        message:
          `No package.json found in ${appPath}.\n\n` +
          '  Scaffold a project first, then pull into it:\n' +
          '    npx create-twenty-app@latest my-app',
      },
    };
  }

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
          code: APP_ERROR_CODES.PULL_FAILED,
          message:
            'Authentication failed. Run `yarn twenty remote:add` to authenticate.',
        },
      };
    }
  }

  onProgress?.('Reading local source files...');

  const scannedFiles = await scanProjectDefineFiles(appPath);
  const localApplicationUniversalIdentifier = scannedFiles.find(
    (scannedFile) => scannedFile.entityKey === ManifestEntityKey.Application,
  )?.universalIdentifier;

  const universalIdentifier =
    options.universalIdentifier ?? localApplicationUniversalIdentifier;

  if (!isDefined(universalIdentifier)) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.PULL_FAILED,
        message:
          'Could not tell which application to pull.\n\n' +
          '  Pass the identifier explicitly:\n' +
          '    yarn twenty pull -u <universalIdentifier>',
      },
    };
  }

  onProgress?.(`Exporting application ${universalIdentifier}...`);

  const exportResult = await apiService.exportApplication(universalIdentifier);

  if (!exportResult.success) {
    const isRefusal = EXPORT_REFUSAL_SUB_CODES.some((subCode) =>
      hasGraphQLErrorSubCode(exportResult.error, subCode),
    );

    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.PULL_FAILED,
        message: isRefusal
          ? (getGraphQLErrorMessage(exportResult.error) ??
            'The server refused to export this application')
          : `Export failed: ${getGraphQLErrorMessage(exportResult.error) ?? exportResult.message ?? 'Unknown error'}`,
      },
    };
  }

  const applicationExport = exportResult.data;
  const { manifest } = applicationExport;

  onProgress?.('Planning source writes...');

  const baseManifest = await readPullBaseManifest({
    appPath,
    applicationUniversalIdentifier: manifest.application.universalIdentifier,
  });

  const plan = planPullWrites({ manifest, baseManifest, scannedFiles });

  onProgress?.('Writing source files...');

  await applyPullWrites({
    appPath,
    writes: plan.writes,
    deletions: plan.deletions,
  });

  await writePullBaseManifest({ appPath, manifest });

  return {
    success: true,
    data: {
      applicationDisplayName: applicationExport.application.displayName,
      applicationUniversalIdentifier:
        applicationExport.application.universalIdentifier,
      writes: plan.writes,
      deletions: plan.deletions,
      unchangedCount: plan.unchanged.length,
      localOnlyRelativePaths: plan.localOnlyRelativePaths,
      skipped: plan.skipped,
      coverage: applicationExport.coverage,
      hadBase: isDefined(baseManifest),
    },
  };
};

export const appPull = (
  options: AppPullOptions,
): Promise<CommandResult<AppPullResult>> =>
  runSafe(() => innerAppPull(options), APP_ERROR_CODES.PULL_FAILED);
