import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { basename, dirname, join } from 'path';
import { type Readable } from 'stream';

import { FileFolder } from 'twenty-shared/types';
import { Like, Repository, type QueryRunner } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { validateResourcePath } from 'src/engine/core-modules/file-storage/utils/validate-resource-path.util';
import { validateSafeRelativePath } from 'src/engine/core-modules/file-storage/utils/validate-safe-relative-path.util';
import { validateStoragePathIsWithinWorkspaceOrThrow } from 'src/engine/core-modules/file-storage/utils/validate-storage-path-is-within-workspace-or-throw.util';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileSettings } from 'src/engine/core-modules/file/types/file-settings.types';

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
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {}

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
  }): string {
    const onStoragePath = join(
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder,
      relativePath,
    ).replace(/\/+/g, '/');

    validateStoragePathIsWithinWorkspaceOrThrow({
      onStoragePath,
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder,
    });

    return onStoragePath;
  }

  private validateAndBuildFileStoragePath(params: ResourceIdentifier): string {
    const validationResult = validateResourcePath({
      resourcePath: params.resourcePath,
      fileFolder: params.fileFolder,
    });

    if (!validationResult.isValid) {
      throw new FileStorageException(
        validationResult.error,
        FileStorageExceptionCode.ACCESS_DENIED,
      );
    }

    return this.buildStoragePathWithinWorkspaceOrThrow({
      ...params,
      relativePath: params.resourcePath,
    });
  }

  private validateAndBuildFolderStoragePath(
    params: Omit<ResourceIdentifier, 'resourcePath'> & { folderPath: string },
  ): string {
    const safePathResult = validateSafeRelativePath({
      resourcePath: params.folderPath,
    });

    if (!safePathResult.isValid) {
      throw new FileStorageException(
        safePathResult.error,
        FileStorageExceptionCode.ACCESS_DENIED,
      );
    }

    return this.buildStoragePathWithinWorkspaceOrThrow({
      ...params,
      relativePath: params.folderPath,
    });
  }

  async writeFile({
    sourceFile,
    mimeType,
    fileFolder,
    applicationUniversalIdentifier,
    workspaceId,
    resourcePath,
    fileId,
    settings,
    queryRunner,
  }: ResourceIdentifier & {
    sourceFile: string | Buffer | Uint8Array;
    mimeType: string | undefined;
    fileId?: string;
    settings: FileSettings;
    queryRunner?: QueryRunner;
  }): Promise<FileEntity> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const applicationRepository = queryRunner
      ? queryRunner.manager.getRepository(ApplicationEntity)
      : this.applicationRepository;
    const fileRepository = queryRunner
      ? queryRunner.manager.getRepository(FileEntity)
      : this.fileRepository;

    const application = await applicationRepository.findOneOrFail({
      where: {
        universalIdentifier: applicationUniversalIdentifier,
        workspaceId,
      },
    });

    const onStoragePath = this.validateAndBuildFileStoragePath({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder,
      resourcePath,
    });

    await driver.writeFile({
      filePath: onStoragePath,
      mimeType,
      sourceFile,
    });

    await fileRepository.upsert(
      {
        path: `${fileFolder}/${resourcePath}`,
        workspaceId,
        applicationId: application.id,
        id: fileId,
        mimeType,
        size:
          typeof sourceFile === 'string'
            ? Buffer.byteLength(sourceFile)
            : sourceFile.length,
        settings,
      },
      ['path', 'workspaceId', 'applicationId'],
    );

    return await fileRepository.findOneOrFail({
      where: {
        path: `${fileFolder}/${resourcePath}`,
        applicationId: application.id,
        workspaceId,
      },
    });
  }

  async getPresignedUrl(
    params: ResourceIdentifier & {
      expiresInSeconds?: number;
      responseContentType?: string;
      responseContentDisposition?: string;
    },
  ): Promise<string | null> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const onStoragePath = this.validateAndBuildFileStoragePath(params);

    return driver.getPresignedUrl({
      filePath: onStoragePath,
      expiresInSeconds: params.expiresInSeconds,
      responseContentType: params.responseContentType,
      responseContentDisposition: params.responseContentDisposition,
    });
  }

  readFile(params: ResourceIdentifier): Promise<Readable> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const onStoragePath = this.validateAndBuildFileStoragePath(params);

    return driver.readFile({ filePath: onStoragePath });
  }

  downloadFile(
    params: ResourceIdentifier & { localPath: string },
  ): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const onStoragePath = this.validateAndBuildFileStoragePath(params);

    return driver.downloadFile({
      onStoragePath,
      localPath: params.localPath,
    });
  }

  async deleteApplicationFiles({
    applicationUniversalIdentifier,
    workspaceId,
  }: {
    applicationUniversalIdentifier: string;
    workspaceId: string;
  }) {
    const application = await this.applicationRepository.findOneOrFail({
      where: {
        universalIdentifier: applicationUniversalIdentifier,
        workspaceId: workspaceId,
      },
    });

    await this.fileRepository.delete({
      applicationId: application.id,
      workspaceId,
    });
  }

  async deleteFile(params: ResourceIdentifier): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const onStoragePath = this.validateAndBuildFileStoragePath(params);

    const deleteResult = driver.delete({ folderPath: onStoragePath });

    const application = await this.applicationRepository.findOneOrFail({
      where: {
        universalIdentifier: params.applicationUniversalIdentifier,
        workspaceId: params.workspaceId,
      },
    });

    const basePath = `${join(params.fileFolder, params.resourcePath)}`.replace(
      /\/+/g,
      '/',
    );

    await this.fileRepository.delete({
      path: Like(`${basePath}%`),
      applicationId: application.id,
      workspaceId: params.workspaceId,
    });

    return deleteResult;
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

    const onStoragePath = this.validateAndBuildFolderStoragePath({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder,
      folderPath,
    });

    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const deleteResult = driver.delete({ folderPath: onStoragePath });

    const application = await this.applicationRepository.findOneOrFail({
      where: {
        universalIdentifier: applicationUniversalIdentifier,
        workspaceId,
      },
    });

    const basePath = `${join(fileFolder, folderPath)}`.replace(/\/+/g, '/');

    await this.fileRepository.delete({
      path: Like(`${basePath}%`),
      applicationId: application.id,
      workspaceId,
    });

    return deleteResult;
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
    const file = await this.fileRepository.findOneOrFail({
      where: {
        id: fileId,
        workspaceId,
        path: Like(`${fileFolder}/%`),
      },
    });

    const application = await this.applicationRepository.findOneOrFail({
      where: { id: file.applicationId, workspaceId: file.workspaceId },
    });

    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    await driver.delete({
      folderPath: `${file.workspaceId}/${application.universalIdentifier}`,
      filename: file.path,
    });

    await this.fileRepository.delete(fileId);
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

    const fromPath = this.validateAndBuildFileStoragePath(from);
    const toPath = this.validateAndBuildFileStoragePath(to);

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
    const onStoragePath = this.validateAndBuildFileStoragePath(params);

    return driver.checkFileExists({ filePath: onStoragePath });
  }
}
