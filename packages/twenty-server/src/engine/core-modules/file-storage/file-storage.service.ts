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
import { prepareFileForStorageOrThrow } from 'src/engine/core-modules/file-storage/utils/prepare-file-for-storage-or-throw.util';
import { validateFilePath } from 'src/engine/core-modules/file-storage/utils/validate-file-path.util';
import { validateFolderPath } from 'src/engine/core-modules/file-storage/utils/validate-folder-path.util';
import { validateStoragePathIsWithinWorkspaceOrThrow } from 'src/engine/core-modules/file-storage/utils/validate-storage-path-is-within-workspace-or-throw.util';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileSettings } from 'src/engine/core-modules/file/types/file-settings.types';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';

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
    workspaceId,
    resourcePath,
    fileId,
    settings,
    queryRunner,
  }: ResourceIdentifier & {
    sourceFile: string | Buffer | Uint8Array;
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

    const fileEntityPayload = {
      path: filePath,
      workspaceId,
      applicationId: application.id,
      id: fileId,
      mimeType,
      size:
        typeof persistedSourceFile === 'string'
          ? Buffer.byteLength(persistedSourceFile)
          : persistedSourceFile.length,
      settings,
    };

    if (queryRunner) {
      await fileRepository.upsert(fileEntityPayload, [
        'path',
        'workspaceId',
        'applicationId',
      ]);

      return await fileRepository.findOneOrFail({
        where: {
          path: filePath,
          applicationId: application.id,
          workspaceId,
        },
      });
    }

    return await this.fileRepository.manager.transaction(
      async (transactionManager) => {
        const transactionalFileRepository =
          transactionManager.getRepository(FileEntity);

        await transactionalFileRepository.upsert(fileEntityPayload, [
          'path',
          'workspaceId',
          'applicationId',
        ]);

        return await transactionalFileRepository.findOneOrFail({
          where: {
            path: filePath,
            applicationId: application.id,
            workspaceId,
          },
        });
      },
    );
  }

  async getPresignedUrl(
    params: ResourceIdentifier & {
      expiresInSeconds?: number;
      responseContentType?: string;
      responseContentDisposition?: string;
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

    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    await driver.delete({
      folderPath: `${workspaceId}/${applicationUniversalIdentifier}/`,
    });

    await this.fileRepository.delete({
      applicationId: application.id,
      workspaceId,
    });
  }

  async deleteFile(params: ResourceIdentifier): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const { onStorageFilePath, filePath } =
      this.validateAndBuildFileStoragePathOrThrow(params);

    await driver.delete({
      folderPath: dirname(onStorageFilePath),
      filename: basename(onStorageFilePath),
    });

    const application = await this.applicationRepository.findOneOrFail({
      where: {
        universalIdentifier: params.applicationUniversalIdentifier,
        workspaceId: params.workspaceId,
      },
    });

    await this.fileRepository.delete({
      path: filePath,
      applicationId: application.id,
      workspaceId: params.workspaceId,
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

    const application = await this.applicationRepository.findOneOrFail({
      where: {
        universalIdentifier: applicationUniversalIdentifier,
        workspaceId,
      },
    });

    await this.fileRepository.delete({
      path: Like(`${validatedFolderPath}%`),
      applicationId: application.id,
      workspaceId,
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

    await this.deleteFile({
      workspaceId,
      applicationUniversalIdentifier: application.universalIdentifier,
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
