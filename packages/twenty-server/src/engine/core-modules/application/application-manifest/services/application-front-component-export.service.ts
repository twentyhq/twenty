import { Injectable } from '@nestjs/common';
import {
  isRestorableFrontComponentSourcePath,
  type FrontComponentManifest,
} from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

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
    dependencyFiles,
    shouldIncludeSourceFiles,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    applicationAllFlatEntityMaps: AllFlatEntityMaps;
    dependencyFiles: ApplicationExportFile[];
    shouldIncludeSourceFiles: boolean;
  }) {
    const frontComponents: FrontComponentManifest[] = [];
    const files: ApplicationExportFile[] = [];
    const coverage: ApplicationExportCoverageEntry[] = [];
    if (!shouldIncludeSourceFiles) {
      return { frontComponents, files, coverage };
    }
    const packageNames = new Set([
      'twenty-sdk',
      'twenty-shared',
      'twenty-client-sdk',
    ]);
    const packageFile = dependencyFiles.find(
      (file) => file.path === 'package.json',
    );
    if (isDefined(packageFile)) {
      const packageJson: unknown = JSON.parse(packageFile.content);
      if (isPlainObject(packageJson)) {
        for (const dependencies of [
          packageJson.dependencies,
          packageJson.devDependencies,
          packageJson.peerDependencies,
          packageJson.optionalDependencies,
        ]) {
          if (isPlainObject(dependencies)) {
            Object.keys(dependencies).forEach((name) => packageNames.add(name));
          }
        }
      }
    }
    for (const component of sortFlatEntitiesByUniversalIdentifier(
      applicationAllFlatEntityMaps.flatFrontComponentMaps,
    )) {
      const manifest =
        fromFlatFrontComponentToFrontComponentManifest(component);
      let reason: string | undefined;
      let content: string | undefined;
      const path = component.sourceComponentPath;
      if (!isDefined(manifest)) {
        reason =
          'widget availability cannot be expressed by a front component definition';
      } else if (!isRestorableFrontComponentSourcePath(path)) {
        reason = 'source path cannot be restored inside an application';
      } else {
        const location = {
          workspaceId,
          applicationUniversalIdentifier,
          fileFolder: FileFolder.Source,
          resourcePath: path,
        };
        if (!(await this.fileStorageService.checkFileExists(location))) {
          reason =
            'source file is missing; apply or publish the application again to store it';
        } else {
          content = (
            await streamToBuffer(
              await this.fileStorageService.readFile(location),
            )
          ).toString('utf8');
          reason = getUnsupportedFrontComponentSourceReason({
            source: content,
            universalIdentifier: component.universalIdentifier,
            name: component.name,
            description: component.description,
            componentName: component.componentName,
            packageNames,
          });
        }
      }
      if (isDefined(reason) || !isDefined(manifest) || !isDefined(content)) {
        coverage.push({
          metadataName: 'frontComponent',
          universalIdentifier: component.universalIdentifier,
          status: ApplicationExportCoverageStatus.UNSUPPORTED,
          reason,
        });
        continue;
      }
      frontComponents.push(manifest);
      coverage.push({
        metadataName: 'frontComponent',
        universalIdentifier: component.universalIdentifier,
        status: ApplicationExportCoverageStatus.EXPORTED,
      });
      files.push({ folder: FileFolder.Source, path, content });
    }
    return { frontComponents, files, coverage };
  }
}
