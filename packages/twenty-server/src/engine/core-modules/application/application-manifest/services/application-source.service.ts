import { msg } from '@lingui/core/macro';
import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import {
  isSourceFileManifestList,
  type SourceFileManifest,
  type Manifest,
} from 'twenty-shared/application';
import { doNotTranslate } from 'twenty-shared/i18n';
import { FileFolder } from 'twenty-shared/types';
import { isDefined, parseJson } from 'twenty-shared/utils';

import { APPLICATION_EXPORT_FILE_BUDGET_BYTES } from 'src/engine/core-modules/application/application-manifest/constants/application-export-file-budget-bytes.constant';
import { type ApplicationExportFile } from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import { type ApplicationSourceResource } from 'src/engine/core-modules/application/application-manifest/types/application-source-resource.type';
import { getApplicationSourceResources } from 'src/engine/core-modules/application/application-manifest/utils/get-application-source-resources.util';
import { validateApplicationSourceInventoryOrThrow } from 'src/engine/core-modules/application/application-manifest/utils/validate-application-source-inventory-or-throw.util';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@Injectable()
export class ApplicationSourceService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  validateOrThrow(
    manifest: Partial<Pick<Manifest, 'frontComponents' | 'logicFunctions'>>,
  ): void {
    for (const resource of getApplicationSourceResources({ manifest })) {
      if (
        isDefined(resource.sourceFiles) &&
        (!isSourceFileManifestList(resource.sourceFiles) ||
          !resource.sourceFiles.some(
            (file) => file.filePath === resource.sourcePath,
          ))
      ) {
        throw new ApplicationException(
          doNotTranslate(
            `Invalid source inventory for ${resource.universalIdentifier}`,
          ),
          ApplicationExceptionCode.INVALID_INPUT,
        );
      }
    }
  }

  async store({
    workspaceId,
    manifest,
  }: {
    workspaceId: string;
    manifest: Partial<Pick<Manifest, 'frontComponents' | 'logicFunctions'>> & {
      application: Pick<Manifest['application'], 'universalIdentifier'>;
    };
  }): Promise<void> {
    let flatLogicFunctionMaps:
      | AllFlatEntityMaps['flatLogicFunctionMaps']
      | undefined;
    if (
      manifest.logicFunctions?.some((logicFunction) =>
        isDefined(logicFunction.sourceFiles),
      )
    ) {
      ({ flatLogicFunctionMaps } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatLogicFunctionMaps',
        ]));
    }
    const resources = getApplicationSourceResources({
      manifest,
      flatLogicFunctionMaps,
    });
    for (const resource of resources) {
      if (
        !isDefined(resource.sourceFiles) &&
        !(await this.fileStorageService.checkFileExists({
          workspaceId,
          applicationUniversalIdentifier:
            manifest.application.universalIdentifier,
          fileFolder: FileFolder.Dependencies,
          resourcePath: resource.inventoryPath,
        }))
      ) {
        continue;
      }
      await this.fileStorageService.writeFile({
        workspaceId,
        applicationUniversalIdentifier:
          manifest.application.universalIdentifier,
        fileFolder: FileFolder.Dependencies,
        resourcePath: resource.inventoryPath,
        sourceFile: JSON.stringify({
          ...resource.metadata,
          sourceFiles: resource.sourceFiles ?? null,
        }),
        settings: { isTemporaryFile: false, toDelete: false },
      });
    }
  }

  async read({
    workspaceId,
    applicationUniversalIdentifier,
    resource,
    remainingBytes,
    exportedFiles = [],
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    resource: ApplicationSourceResource;
    remainingBytes: number;
    exportedFiles?: ApplicationExportFile[];
  }): Promise<
    | {
        sourceFiles: SourceFileManifest[];
        files: ApplicationExportFile[];
      }
    | undefined
  > {
    const location = {
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.Dependencies,
      resourcePath: resource.inventoryPath,
    };
    if (!(await this.fileStorageService.checkFileExists(location))) {
      return undefined;
    }
    const inventory = parseJson<unknown>(
      (
        await streamToBuffer(
          await this.fileStorageService.readFile(location),
          APPLICATION_EXPORT_FILE_BUDGET_BYTES,
        )
      ).toString('utf8'),
    );
    const sourceFiles = validateApplicationSourceInventoryOrThrow({
      inventory,
      resource,
    });
    if (!isDefined(sourceFiles)) {
      return undefined;
    }
    const files: ApplicationExportFile[] = [];
    for (const { filePath, checksum } of sourceFiles) {
      const existing = exportedFiles.find((file) => file.path === filePath);
      if (isDefined(existing)) {
        const content = Buffer.from(
          existing.content,
          existing.encoding === 'base64' ? 'base64' : 'utf8',
        );
        if (createHash('md5').update(content).digest('hex') !== checksum) {
          throw new ApplicationException(
            doNotTranslate(
              `Conflicting source checksums for ${filePath}; apply or publish again`,
            ),
            ApplicationExceptionCode.INVALID_INPUT,
            {
              userFriendlyMessage: msg`Apply or publish the application again to restore its application sources.`,
            },
          );
        }
        files.push(
          filePath === resource.sourcePath
            ? {
                folder: FileFolder.Source,
                path: filePath,
                content: content.toString('utf8'),
              }
            : existing,
        );
        continue;
      }
      const sourceLocation = {
        ...location,
        fileFolder: FileFolder.Source,
        resourcePath: filePath,
      };
      if (!(await this.fileStorageService.checkFileExists(sourceLocation))) {
        throw new ApplicationException(
          doNotTranslate(
            `Source file ${filePath} is missing; apply or publish again`,
          ),
          ApplicationExceptionCode.INVALID_INPUT,
          {
            userFriendlyMessage: msg`Apply or publish the application again to restore its application sources.`,
          },
        );
      }
      const content = await streamToBuffer(
        await this.fileStorageService.readFile(sourceLocation),
        remainingBytes,
      );
      remainingBytes -= content.length;
      if (createHash('md5').update(content).digest('hex') !== checksum) {
        throw new ApplicationException(
          doNotTranslate(
            `Source file ${filePath} changed since the deployed inventory; apply or publish again`,
          ),
          ApplicationExceptionCode.INVALID_INPUT,
          {
            userFriendlyMessage: msg`Apply or publish the application again to restore its application sources.`,
          },
        );
      }
      files.push({
        folder: FileFolder.Source,
        path: filePath,
        content:
          filePath === resource.sourcePath
            ? content.toString('utf8')
            : content.toString('base64'),
        ...(filePath !== resource.sourcePath
          ? { encoding: 'base64' as const }
          : {}),
      });
    }
    return { sourceFiles, files };
  }
}
