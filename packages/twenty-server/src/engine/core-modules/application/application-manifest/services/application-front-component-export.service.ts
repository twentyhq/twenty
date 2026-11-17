import { ApplicationFrontComponentSourceService } from 'src/engine/core-modules/application/application-manifest/services/application-front-component-source.service';
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
    private readonly applicationFrontComponentSourceService: ApplicationFrontComponentSourceService,
  ) {}

  async exportFrontComponents({
    workspaceId,
    applicationUniversalIdentifier,
    applicationAllFlatEntityMaps,
    shouldIncludeSourceFiles,
    shouldIncludeSourceDependencies = false,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    applicationAllFlatEntityMaps: AllFlatEntityMaps;
    shouldIncludeSourceFiles: boolean;
    shouldIncludeSourceDependencies?: boolean;
  }) {
    const frontComponents: FrontComponentManifest[] = [];
    const files: ApplicationExportFile[] = [];
    const coverage: ApplicationExportCoverageEntry[] = [];
    if (!shouldIncludeSourceFiles) {
      return { frontComponents, files, coverage };
    }
    let remainingBytes = 8 * 1024 * 1024;
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
      let inventory: Awaited<
        ReturnType<ApplicationFrontComponentSourceService['read']>
      >;
      try {
        inventory = shouldIncludeSourceDependencies
          ? await this.applicationFrontComponentSourceService.read({
              workspaceId,
              applicationUniversalIdentifier,
              component: manifest,
              remainingBytes,
              exportedFiles: files,
            })
          : undefined;
      } catch (error) {
        coverage.push({
          ...unsupportedCoverage,
          reason:
            error instanceof Error
              ? error.message
              : 'Unable to restore front component sources',
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
      const content =
        inventory?.files.find((file) => file.path === path)?.content ??
        (
          await streamToBuffer(
            await this.fileStorageService.readFile(location),
            remainingBytes,
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
      frontComponents.push(
        isDefined(inventory)
          ? { ...manifest, sourceFiles: inventory.sourceFiles }
          : manifest,
      );
      coverage.push({
        ...unsupportedCoverage,
        status: ApplicationExportCoverageStatus.EXPORTED,
      });
      for (const file of inventory?.files ?? [
        { folder: FileFolder.Source, path, content },
      ]) {
        const existing = files.find((entry) => entry.path === file.path);
        if (isDefined(existing)) {
          continue;
        }
        remainingBytes -= Buffer.byteLength(
          file.content,
          file.encoding === 'base64' ? 'base64' : 'utf8',
        );
        files.push(file);
      }
    }
    return { frontComponents, files, coverage };
  }
}
