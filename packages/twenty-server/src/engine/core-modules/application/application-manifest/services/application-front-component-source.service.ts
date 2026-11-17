import { APPLICATION_EXPORT_FILE_BUDGET_BYTES } from 'src/engine/core-modules/application/application-manifest/constants/application-export-file-budget-bytes.constant';
import { Injectable } from '@nestjs/common';
import { msg } from '@lingui/core/macro';
import { doNotTranslate } from 'twenty-shared/i18n';
import { createHash } from 'node:crypto';
import {
  isSourceFileManifestList,
  type FrontComponentManifest,
  type Manifest,
} from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isDefined, isPlainObject, parseJson } from 'twenty-shared/utils';

import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { type ApplicationExportFile } from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@Injectable()
export class ApplicationFrontComponentSourceService {
  constructor(private readonly fileStorageService: FileStorageService) {}

  validateOrThrow(manifest: Pick<Manifest, 'frontComponents'>): void {
    for (const component of manifest.frontComponents ?? []) {
      if (
        isDefined(component.sourceFiles) &&
        (!isSourceFileManifestList(component.sourceFiles) ||
          !component.sourceFiles.some(
            (file) => file.filePath === component.sourceComponentPath,
          ))
      ) {
        throw new ApplicationException(
          doNotTranslate(
            `Invalid source inventory for front component ${component.universalIdentifier}`,
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
    manifest: Pick<Manifest, 'frontComponents'> & {
      application: Pick<Manifest['application'], 'universalIdentifier'>;
    };
  }): Promise<void> {
    for (const component of manifest.frontComponents ?? []) {
      if (
        !isDefined(component.sourceFiles) &&
        !(await this.fileStorageService.checkFileExists({
          workspaceId,
          applicationUniversalIdentifier:
            manifest.application.universalIdentifier,
          fileFolder: FileFolder.Dependencies,
          resourcePath: `front-component-sources/${component.universalIdentifier}.json`,
        }))
      ) {
        continue;
      }
      await this.fileStorageService.writeFile({
        workspaceId,
        applicationUniversalIdentifier:
          manifest.application.universalIdentifier,
        fileFolder: FileFolder.Dependencies,
        resourcePath: `front-component-sources/${component.universalIdentifier}.json`,
        sourceFile: JSON.stringify({
          sourceComponentPath: component.sourceComponentPath,
          builtComponentChecksum: component.builtComponentChecksum,
          sourceFiles: component.sourceFiles ?? null,
        }),
        settings: { isTemporaryFile: false, toDelete: false },
      });
    }
  }

  async read({
    workspaceId,
    applicationUniversalIdentifier,
    component,
    remainingBytes,
    exportedFiles = [],
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    component: FrontComponentManifest;
    remainingBytes: number;
    exportedFiles?: ApplicationExportFile[];
  }): Promise<
    | {
        sourceFiles: NonNullable<FrontComponentManifest['sourceFiles']>;
        files: ApplicationExportFile[];
      }
    | undefined
  > {
    const location = {
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.Dependencies,
      resourcePath: `front-component-sources/${component.universalIdentifier}.json`,
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
    if (!isPlainObject(inventory)) {
      throw new ApplicationException(
        doNotTranslate('Stored front component source inventory is invalid'),
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }
    if (!isDefined(inventory.sourceFiles)) {
      return undefined;
    }
    if (
      inventory.builtComponentChecksum !== component.builtComponentChecksum ||
      inventory.sourceComponentPath !== component.sourceComponentPath ||
      !isSourceFileManifestList(inventory.sourceFiles) ||
      !inventory.sourceFiles.some(
        (file) => file.filePath === component.sourceComponentPath,
      )
    ) {
      throw new ApplicationException(
        doNotTranslate(
          'Source inventory does not match the deployed front component; apply or publish again',
        ),
        ApplicationExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`Apply or publish the application again to restore its frontend component sources.`,
        },
      );
    }
    const files: ApplicationExportFile[] = [];
    for (const { filePath, checksum } of inventory.sourceFiles) {
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
              userFriendlyMessage: msg`Apply or publish the application again to restore its frontend component sources.`,
            },
          );
        }
        files.push(
          filePath === component.sourceComponentPath
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
            userFriendlyMessage: msg`Apply or publish the application again to restore its frontend component sources.`,
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
            userFriendlyMessage: msg`Apply or publish the application again to restore its frontend component sources.`,
          },
        );
      }
      files.push({
        folder: FileFolder.Source,
        path: filePath,
        content:
          filePath === component.sourceComponentPath
            ? content.toString('utf8')
            : content.toString('base64'),
        ...(filePath !== component.sourceComponentPath
          ? { encoding: 'base64' as const }
          : {}),
      });
    }
    return { sourceFiles: inventory.sourceFiles, files };
  }
}
