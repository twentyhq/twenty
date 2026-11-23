import { getApplicationSourceResources } from 'src/engine/core-modules/application/application-manifest/utils/get-application-source-resources.util';
import { ApplicationException } from 'src/engine/core-modules/application/application.exception';
import { StreamSizeExceededError } from 'src/utils/stream-size-exceeded-error';
import { APPLICATION_EXPORT_FILE_BUDGET_BYTES } from 'src/engine/core-modules/application/application-manifest/constants/application-export-file-budget-bytes.constant';
import { type ApplicationExportFileBudget } from 'src/engine/core-modules/application/application-manifest/types/application-export-file-budget.type';
import { ApplicationSourceService } from 'src/engine/core-modules/application/application-manifest/services/application-source.service';
import { Injectable } from '@nestjs/common';
import {
  isRestorableFrontComponentSourcePath,
  type FrontComponentManifest,
} from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { fromFlatFrontComponentToFrontComponentManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-front-component-to-front-component-manifest.util';
import {
  type ApplicationExportCoverageEntry,
  type ApplicationExportFile,
} from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import { getUnsupportedFrontComponentSourceReason } from 'src/engine/core-modules/application/application-manifest/utils/get-unsupported-front-component-source-reason.util';
import { sortFlatEntitiesByUniversalIdentifier } from 'src/engine/core-modules/application/application-manifest/utils/sort-flat-entities-by-universal-identifier.util';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@Injectable()
export class ApplicationFrontComponentExportService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly applicationSourceService: ApplicationSourceService,
  ) {}

  async exportFrontComponents({
    workspaceId,
    applicationUniversalIdentifier,
    applicationAllFlatEntityMaps,
    shouldIncludeSourceFiles,
    shouldIncludeSourceDependencies = false,
    fileBudget = { remainingBytes: APPLICATION_EXPORT_FILE_BUDGET_BYTES },
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    applicationAllFlatEntityMaps: AllFlatEntityMaps;
    shouldIncludeSourceFiles: boolean;
    shouldIncludeSourceDependencies?: boolean;
    fileBudget?: ApplicationExportFileBudget;
  }) {
    const frontComponents: FrontComponentManifest[] = [];
    const files: ApplicationExportFile[] = [];
    const coverage: ApplicationExportCoverageEntry[] = [];
    if (!shouldIncludeSourceFiles) {
      return { frontComponents, files, coverage };
    }
    for (const component of sortFlatEntitiesByUniversalIdentifier(
      applicationAllFlatEntityMaps.flatFrontComponentMaps,
    )) {
      const unsupportedCoverage: ApplicationExportCoverageEntry = {
        metadataName: 'frontComponent',
        universalIdentifier: component.universalIdentifier,
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
      };
      const manifest =
        fromFlatFrontComponentToFrontComponentManifest(component);
      if (!isDefined(manifest)) {
        coverage.push({
          ...unsupportedCoverage,
          reason:
            'widget availability cannot be expressed by a front component definition',
        });
        continue;
      }
      const path = component.sourceComponentPath;
      if (!isRestorableFrontComponentSourcePath(path)) {
        coverage.push({
          ...unsupportedCoverage,
          reason: 'source path cannot be restored inside an application',
        });
        continue;
      }
      try {
        const inventory = shouldIncludeSourceDependencies
          ? await this.applicationSourceService.read({
              workspaceId,
              applicationUniversalIdentifier,
              resource: getApplicationSourceResources({
                manifest: { frontComponents: [manifest] },
              })[0],
              remainingBytes: fileBudget.remainingBytes,
              exportedFiles: files,
            })
          : undefined;
        const location = {
          workspaceId,
          applicationUniversalIdentifier,
          fileFolder: FileFolder.Source,
          resourcePath: path,
        };
        if (!(await this.fileStorageService.checkFileExists(location))) {
          coverage.push({
            ...unsupportedCoverage,
            reason:
              'source file is missing; apply or publish the application again to store it',
          });
          continue;
        }
        const content =
          inventory?.files.find((file) => file.path === path)?.content ??
          (
            await streamToBuffer(
              await this.fileStorageService.readFile(location),
              fileBudget.remainingBytes,
            )
          ).toString('utf8');
        const reason = getUnsupportedFrontComponentSourceReason({
          source: content,
          universalIdentifier: component.universalIdentifier,
          name: component.name,
          description: component.description,
          componentName: component.componentName,
        });
        if (isDefined(reason)) {
          coverage.push({ ...unsupportedCoverage, reason });
          continue;
        }
        const componentFiles = inventory?.files ?? [
          { folder: FileFolder.Source, path, content },
        ];
        const newFiles = componentFiles.filter(
          (file) => !files.some((existing) => existing.path === file.path),
        );
        const encodedBytes = Buffer.byteLength(JSON.stringify(newFiles));
        if (encodedBytes > fileBudget.remainingBytes) {
          coverage.push({
            ...unsupportedCoverage,
            reason:
              'Front component sources exceed the remaining shared file export budget.',
          });
          continue;
        }
        fileBudget.remainingBytes -= encodedBytes;
        frontComponents.push(
          isDefined(inventory)
            ? { ...manifest, sourceFiles: inventory.sourceFiles }
            : manifest,
        );
        coverage.push({
          ...unsupportedCoverage,
          status: ApplicationExportCoverageStatus.EXPORTED,
        });
        files.push(...newFiles);
      } catch (error) {
        if (
          !(error instanceof StreamSizeExceededError) &&
          !(error instanceof ApplicationException)
        ) {
          throw error;
        }
        coverage.push({
          ...unsupportedCoverage,
          reason:
            error instanceof Error
              ? error.message
              : 'Unable to restore front component sources',
        });
        continue;
      }
    }
    return { frontComponents, files, coverage };
  }
}
