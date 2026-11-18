import {
  type LogicFunctionManifest,
  isRestorableApplicationSourcePath,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { fromFlatLogicFunctionToLogicFunctionManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-logic-function-to-logic-function-manifest.util';
import { type ApplicationSourceService } from 'src/engine/core-modules/application/application-manifest/services/application-source.service';
import { type ApplicationExportFileBudget } from 'src/engine/core-modules/application/application-manifest/types/application-export-file-budget.type';
import {
  type ApplicationExportCoverageEntry,
  type ApplicationExportFile,
} from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import { getApplicationSourceResources } from 'src/engine/core-modules/application/application-manifest/utils/get-application-source-resources.util';
import { sortFlatEntitiesByUniversalIdentifier } from 'src/engine/core-modules/application/application-manifest/utils/sort-flat-entities-by-universal-identifier.util';
import { ApplicationException } from 'src/engine/core-modules/application/application.exception';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { StreamSizeExceededError } from 'src/utils/stream-size-exceeded-error';

export const exportLogicFunctionSources = async ({
  workspaceId,
  applicationUniversalIdentifier,
  applicationAllFlatEntityMaps,
  shouldIncludeLogicFunctionSources,
  fileBudget,
  exportedFiles,
  readSource,
}: {
  workspaceId: string;
  applicationUniversalIdentifier: string;
  applicationAllFlatEntityMaps: AllFlatEntityMaps;
  shouldIncludeLogicFunctionSources: boolean;
  fileBudget: ApplicationExportFileBudget;
  exportedFiles: ApplicationExportFile[];
  readSource: ApplicationSourceService['read'];
}) => {
  const logicFunctions: LogicFunctionManifest[] = [];
  const files: ApplicationExportFile[] = [];
  const coverage: ApplicationExportCoverageEntry[] = [];
  if (!shouldIncludeLogicFunctionSources) {
    return { logicFunctions, files, coverage };
  }
  for (const logicFunction of sortFlatEntitiesByUniversalIdentifier(
    applicationAllFlatEntityMaps.flatLogicFunctionMaps,
  )) {
    const unsupportedCoverage: ApplicationExportCoverageEntry = {
      metadataName: 'logicFunction',
      universalIdentifier: logicFunction.universalIdentifier,
      status: ApplicationExportCoverageStatus.UNSUPPORTED,
    };
    if (!isRestorableApplicationSourcePath(logicFunction.sourceHandlerPath)) {
      coverage.push({
        ...unsupportedCoverage,
        reason: 'source path cannot be restored inside an application',
      });
      continue;
    }
    if (!logicFunction.isBuildUpToDate) {
      coverage.push({
        ...unsupportedCoverage,
        reason:
          'logic function sources changed since the last build; apply the application again',
      });
      continue;
    }
    const manifest =
      fromFlatLogicFunctionToLogicFunctionManifest(logicFunction);
    if (!isDefined(manifest)) {
      coverage.push({
        ...unsupportedCoverage,
        reason:
          'logic function build checksum is missing; apply the application again',
      });
      continue;
    }
    try {
      const existingFiles = [...exportedFiles, ...files];
      const inventory = await readSource({
        workspaceId,
        applicationUniversalIdentifier,
        resource: getApplicationSourceResources({
          manifest: { logicFunctions: [manifest] },
          flatLogicFunctionMaps:
            applicationAllFlatEntityMaps.flatLogicFunctionMaps,
        })[0],
        remainingBytes: fileBudget.remainingBytes,
        exportedFiles: existingFiles,
      });
      if (!isDefined(inventory)) {
        coverage.push({
          ...unsupportedCoverage,
          reason:
            'logic function source inventory is missing; apply the application with the current CLI to store its sources',
        });
        continue;
      }
      const newFiles = inventory.files.filter(
        (file) =>
          !existingFiles.some((existing) => existing.path === file.path),
      );
      const encodedBytes = Buffer.byteLength(JSON.stringify(newFiles));
      if (encodedBytes > fileBudget.remainingBytes) {
        coverage.push({
          ...unsupportedCoverage,
          reason:
            'Logic function sources exceed the remaining shared file export budget.',
        });
        continue;
      }
      fileBudget.remainingBytes -= encodedBytes;
      logicFunctions.push({
        ...manifest,
        sourceFiles: inventory.sourceFiles,
      });
      files.push(...newFiles);
      coverage.push({
        ...unsupportedCoverage,
        status: ApplicationExportCoverageStatus.EXPORTED,
      });
    } catch (error) {
      if (
        !(error instanceof StreamSizeExceededError) &&
        !(error instanceof ApplicationException)
      ) {
        throw error;
      }
      coverage.push({ ...unsupportedCoverage, reason: error.message });
    }
  }
  return { logicFunctions, files, coverage };
};
