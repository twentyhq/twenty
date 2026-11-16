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
  constructor(private readonly fileStorageService: FileStorageService) {}

  async exportFrontComponents({
    workspaceId,
    applicationUniversalIdentifier,
    applicationAllFlatEntityMaps,
    shouldIncludeSourceFiles,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    applicationAllFlatEntityMaps: AllFlatEntityMaps;
    shouldIncludeSourceFiles: boolean;
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
      const content = (
        await streamToBuffer(await this.fileStorageService.readFile(location))
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
      frontComponents.push(manifest);
      coverage.push({
        ...unsupportedCoverage,
        status: ApplicationExportCoverageStatus.EXPORTED,
      });
      files.push({ folder: FileFolder.Source, path, content });
    }
    return { frontComponents, files, coverage };
  }
}
