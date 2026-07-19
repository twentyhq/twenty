import { Injectable } from '@nestjs/common';

import { basename, dirname, join } from 'path';
import { type Readable } from 'stream';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Like, type QueryRunner } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { findActiveFlatApplicationById } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-id.util';
import { findActiveFlatApplicationByUniversalIdentifier } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-universal-identifier.util';
import { FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { prepareFileForStorageOrThrow } from 'src/engine/core-modules/file-storage/utils/prepare-file-for-storage-or-throw.util';
import { validateFilePath } from 'src/engine/core-modules/file-storage/utils/validate-file-path.util';
import { validateFolderPath } from 'src/engine/core-modules/file-storage/utils/validate-folder-path.util';
import { validateStoragePathIsWithinWorkspaceOrThrow } from 'src/engine/core-modules/file-storage/utils/validate-storage-path-is-within-workspace-or-throw.util';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileSettings } from 'src/engine/core-modules/file/types/file-settings.types';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
export type ResourceIdentifier = {
  workspaceId: string;
  applicationUniversalIdentifier: string;
  fileFolder: FileFolder;
  resourcePath: string;
};

@Injectable()
export class FileStorageService {
  constructor(
    private readonly fileStorageDriverFactory: FileStorageDriverFactory,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  private async resolveApplicationIdOrThrow({
    applicationUniversalIdentifier,
    workspaceId,
    queryRunner,
  }: {
    applicationUniversalIdentifier: string;
    workspaceId: string;
    queryRunner?: QueryRunner;
  }): Promise<string> {
    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
      ]);

    const cachedApplication = findActiveFlatApplicationByUniversalIdentifier(
      flatApplicationMaps,
      applicationUniversalIdentifier,
    );

    if (isDefined(cachedApplication)) {
      return cachedApplication.id;
    }

    if (isDefined(queryRunner)) {
      const application = await queryRunner.manager
        .getRepository(ApplicationEntity)
        .findOne({
          where: {
            universalIdentifier: applicationUniversalIdentifier,
            workspaceId,
          },
        });

      if (isDefined(application)) {
        return application.id;
      }
    }

    throw new FileStorageException(
      `Application with universalIdentifier "${applicationUniversalIdentifier}" not found`,
      FileStorageExceptionCode.FILE_NOT_FOUND,
    );
  }

  private async resolveApplicationUniversalIdentifierOrThrow({
    applicationId,
    workspaceId,
  }: {
    applicationId: string;
    workspaceId: string;
  }): Promise<string> {
    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
      ]);

    const application = findActiveFlatApplicationById(
      flatApplicationMaps,
      applicationId,
    );

    if (!isDefined(application)) {
      throw new FileStorageException(
        `Application with id "${applicationId}" not found`,
        FileStorageExceptionCode.FILE_NOT_FOUND,
      );
    }

    return application.universalIdentifier;
  }

  private buildStoragePathWithinWorkspaceOrThrow({
    workspaceId,
    applicationUniversalIdentifier,
    fileFolder,
    relativePath,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    fileFolder: FileFolder;
    relativePath: string;
  }): { onStoragePath: string; resourcePath: string } {
    const resourcePath = join(fileFolder, relativePath).replace(/\/+/g, '/');

    const onStoragePath = join(
      workspaceId,
      applicationUniversalIdentifier,
      resourcePath,
    ).replace(/\/+/g, '/');

    validateStoragePathIsWithinWorkspaceOrThrow({
      onStoragePath,
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder,
    });

    return { onStoragePath, resourcePath };
  }

  private validateAndBuildFileStoragePathOrThrow(params: ResourceIdentifier): {
    onStorageFilePath: string;
    filePath: string;
  } {
    const validationResult = validateFilePath({
      resourcePath: params.resourcePath,
      fileFolder: params.fileFolder,
    });

    if (!validationResult.isValid) {
      throw new FileStorageException(
        validationResult.error,
        FileStorageExceptionCode.ACCESS_DENIED,
      );
    }

    const { onStoragePath, resourcePath } =
      this.buildStoragePathWithinWorkspaceOrThrow({
        ...params,
        relativePath: params.resourcePath,
      });

    return { onStorageFilePath: onStoragePath, filePath: resourcePath };
  }

  private validateAndBuildFolderStoragePathOrThrow(
    params: Omit<ResourceIdentifier, 'resourcePath'> & { folderPath: string },
  ): { onStorageFolderPath: string; folderPath: string } {
    const validationResult = validateFolderPath({
      folderPath: params.folderPath,
    });

    if (!validationResult.isValid) {
      throw new FileStorageException(
        validationResult.error,
        FileStorageExceptionCode.ACCESS_DENIED,
      );
    }

    const { onStoragePath, resourcePath } =
      this.buildStoragePathWithinWorkspaceOrThrow({
        ...params,
        relativePath: params.folderPath,
      });

    return {
      onStorageFolderPath: `${onStoragePath}/`,
      folderPath: `${resourcePath}/`,
    };
  }

  async writeFile({
    sourceFile,
    fileFolder,
    applicationUniversalIdentifier,
    applicationId,
    workspaceId,
    resourcePath,
    fileId,
    settings,
    queryRunner,
  }: ResourceIdentifier & {
    sourceFile: string | Buffer | Uint8Array;
    applicationId?: string;
    fileId?: string;
    settings: FileSettings;
    queryRunner?: QueryRunner;
  }): Promise<FileEntity> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const resolvedApplicationId =
      applicationId ??
      (await this.resolveApplicationIdOrThrow({
        applicationUniversalIdentifier,
        workspaceId,
        queryRunner,
      }));

    const fileRepository = isDefined(queryRunner)
      ? this.fileRepository.withManager(queryRunner.manager)
      : this.fileRepository;

    const { onStorageFilePath, filePath } =
      this.validateAndBuildFileStoragePathOrThrow({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder,
        resourcePath,
      });

    const { sourceFile: persistedSourceFile, mimeType } =
      await prepareFileForStorageOrThrow({
        sourceFile,
        resourcePath,
      });

    await driver.writeFile({
      filePath: onStorageFilePath,
      mimeType,
      sourceFile: persistedSourceFile,
    });

    return fileRepository.upsertAndReturnOne(
      workspaceId,
      {
        path: filePath,
        applicationId: resolvedApplicationId,
        id: fileId,
        mimeType,
        size:
          typeof persistedSourceFile === 'string'
            ? Buffer.byteLength(persistedSourceFile)
            : persistedSourceFile.length,
        settings,
      },
      ['path', 'workspaceId', 'applicationId'],
    );
  }

  // Creates the file record ahead of a direct client upload. The bytes are
  // not in storage yet: the record stays PENDING until the upload is
  // confirmed (completeFileUpload) or reaped by the cleanup cron.
  async createPendingFile({
    fileFolder,
    applicationUniversalIdentifier,
    workspaceId,
    resourcePath,
    fileId,
    size,
    mimeType,
    settings,
  }: ResourceIdentifier & {
    fileId: string;
    size: number;
    mimeType: string;
    settings: FileSettings;
  }): Promise<FileEntity> {
    const applicationId = await this.resolveApplicationIdOrThrow({
      applicationUniversalIdentifier,
      workspaceId,
    });

    const { filePath } = this.validateAndBuildFileStoragePathOrThrow({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder,
      resourcePath,
    });

    return this.fileRepository.upsertAndReturnOne(
      workspaceId,
      {
        path: filePath,
        applicationId,
        id: fileId,
        mimeType,
        size,
        settings,
        status: FILE_STATUS.PENDING,
      },
      ['path', 'workspaceId', 'applicationId'],
    );
  }

  async writeFileStream(
    params: ResourceIdentifier & {
      stream: Readable;
      mimeType: string | undefined;
    },
  ): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const { onStorageFilePath } =
      this.validateAndBuildFileStoragePathOrThrow(params);

    return driver.writeFileStream({
      filePath: onStorageFilePath,
      stream: params.stream,
      mimeType: params.mimeType,
    });
  }

  async getFileMetadata(
    params: ResourceIdentifier,
  ): Promise<{ size: number } | null> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const { onStorageFilePath } =
      this.validateAndBuildFileStoragePathOrThrow(params);

    return driver.getFileMetadata({ filePath: onStorageFilePath });
  }

  async getPresignedUploadUrl(
    params: ResourceIdentifier & {
      contentType: string;
      contentLength: number;
      expiresInSeconds?: number;
    },
  ): Promise<string | null> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const { onStorageFilePath } =
      this.validateAndBuildFileStoragePathOrThrow(params);

    return driver.getPresignedUploadUrl({
      filePath: onStorageFilePath,
      contentType: params.contentType,
      contentLength: params.contentLength,
      expiresInSeconds: params.expiresInSeconds,
    });
  }

  async getPresignedUrl(
    params: ResourceIdentifier & {
      expiresInSeconds?: number;
      responseContentType?: string;
      responseContentDisposition?: string;
      responseCacheControl?: string;
    },
  ): Promise<string | null> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const { onStorageFilePath } =
      this.validateAndBuildFileStoragePathOrThrow(params);

    return driver.getPresignedUrl({
      filePath: onStorageFilePath,
      expiresInSeconds: params.expiresInSeconds,
      responseContentType: params.responseContentType,
      responseContentDisposition: params.responseContentDisposition,
      responseCacheControl: params.responseCacheControl,
    });
  }

  readFile(params: ResourceIdentifier): Promise<Readable> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const { onStorageFilePath } =
      this.validateAndBuildFileStoragePathOrThrow(params);

    return driver.readFile({ filePath: onStorageFilePath });
  }

  downloadFile(
    params: ResourceIdentifier & { localPath: string },
  ): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const { onStorageFilePath } =
      this.validateAndBuildFileStoragePathOrThrow(params);

    return driver.downloadFile({
      onStoragePath: onStorageFilePath,
      localPath: params.localPath,
    });
  }

  async deleteApplicationFileRows({
    applicationId,
    workspaceId,
    queryRunner,
  }: {
    applicationId: string;
    workspaceId: string;
    queryRunner?: QueryRunner;
  }) {
    const fileRepository = queryRunner
      ? this.fileRepository.withManager(queryRunner.manager)
      : this.fileRepository;

    await fileRepository.delete(workspaceId, { applicationId });
  }

  async deleteApplicationFilesFromStorage({
    applicationUniversalIdentifier,
    workspaceId,
  }: {
    applicationUniversalIdentifier: string;
    workspaceId: string;
  }) {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    await driver.delete({
      folderPath: `${workspaceId}/${applicationUniversalIdentifier}/`,
    });
  }

  async deleteFile(
    params: ResourceIdentifier & { applicationId?: string },
  ): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const { onStorageFilePath, filePath } =
      this.validateAndBuildFileStoragePathOrThrow(params);

    await driver.delete({
      folderPath: dirname(onStorageFilePath),
      filename: basename(onStorageFilePath),
    });

    const applicationId =
      params.applicationId ??
      (await this.resolveApplicationIdOrThrow({
        applicationUniversalIdentifier: params.applicationUniversalIdentifier,
        workspaceId: params.workspaceId,
      }));

    await this.fileRepository.delete(params.workspaceId, {
      path: filePath,
      applicationId,
    });
  }

  async deleteFolder(
    params: Omit<ResourceIdentifier, 'resourcePath'> & { folderPath: string },
  ): Promise<void> {
    const {
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder,
      folderPath,
    } = params;

    const { onStorageFolderPath, folderPath: validatedFolderPath } =
      this.validateAndBuildFolderStoragePathOrThrow({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder,
        folderPath,
      });

    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    await driver.delete({ folderPath: onStorageFolderPath });

    const applicationId = await this.resolveApplicationIdOrThrow({
      applicationUniversalIdentifier,
      workspaceId,
    });

    await this.fileRepository.delete(workspaceId, {
      path: Like(`${validatedFolderPath}%`),
      applicationId,
    });
  }

  async deleteByFileId({
    fileId,
    workspaceId,
    fileFolder,
  }: {
    fileId: string;
    workspaceId: string;
    fileFolder: FileFolder;
  }): Promise<void> {
    const file = await this.fileRepository.findOneOrFail(workspaceId, {
      where: {
        id: fileId,
        path: Like(`${fileFolder}/%`),
      },
    });

    const applicationUniversalIdentifier =
      await this.resolveApplicationUniversalIdentifierOrThrow({
        applicationId: file.applicationId,
        workspaceId,
      });

    await this.deleteFile({
      workspaceId,
      applicationUniversalIdentifier,
      applicationId: file.applicationId,
      fileFolder,
      resourcePath: removeFileFolderFromFileEntityPath(file.path),
    });
  }

  async checkIfWorkspaceFolderExists(workspaceId: string): Promise<boolean> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.checkFolderExists({ folderPath: workspaceId });
  }

  async deleteWorkspaceFolder(workspaceId: string): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    await driver.delete({ folderPath: workspaceId });
  }

  copyLegacy(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.copy(params);
  }

  async copy({
    from,
    to,
  }: {
    from: ResourceIdentifier;
    to: ResourceIdentifier;
  }): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const { onStorageFilePath: fromPath } =
      this.validateAndBuildFileStoragePathOrThrow(from);
    const { onStorageFilePath: toPath } =
      this.validateAndBuildFileStoragePathOrThrow(to);

    const isFile = await driver.checkFileExists({ filePath: fromPath });

    if (isFile) {
      return driver.copy({
        from: { folderPath: dirname(fromPath), filename: basename(fromPath) },
        to: { folderPath: dirname(toPath), filename: basename(toPath) },
      });
    }

    return driver.copy({
      from: { folderPath: fromPath },
      to: { folderPath: toPath },
    });
  }

  checkFileExists(params: ResourceIdentifier): Promise<boolean> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const { onStorageFilePath } =
      this.validateAndBuildFileStoragePathOrThrow(params);

    return driver.checkFileExists({ filePath: onStorageFilePath });
  }
}
