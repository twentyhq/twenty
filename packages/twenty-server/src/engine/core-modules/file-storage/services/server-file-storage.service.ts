import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { basename, dirname, join } from 'path';
import { type Readable } from 'stream';

import { type ServerFileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { SERVER_FILE_STORAGE_PREFIX } from 'src/engine/core-modules/file-storage/constants/server-file-storage-prefix.constant';
import { FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { validateFilePath } from 'src/engine/core-modules/file-storage/utils/validate-file-path.util';
import { validateStoragePathIsWithinServerScopeOrThrow } from 'src/engine/core-modules/file-storage/utils/validate-storage-path-is-within-server-scope-or-throw.util';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';

export type ServerResourceIdentifier = {
  fileFolder: ServerFileFolder;
  resourcePath: string;
};

@Injectable()
export class ServerFileStorageService {
  private readonly logger = new Logger(ServerFileStorageService.name);

  constructor(
    private readonly fileStorageDriverFactory: FileStorageDriverFactory,
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository -- server-scoped rows (workspaceId IS NULL) are unreachable through the scoped wrapper; every query below pins workspaceId to IsNull()
    @InjectRepository(FileEntity)
    private readonly serverFileRepository: Repository<FileEntity>,
  ) {}

  private validateAndBuildServerFileStoragePathOrThrow({
    fileFolder,
    resourcePath,
  }: ServerResourceIdentifier): {
    onStorageFilePath: string;
    filePath: string;
  } {
    const validationResult = validateFilePath({ resourcePath, fileFolder });

    if (!validationResult.isValid) {
      throw new FileStorageException(
        validationResult.error,
        FileStorageExceptionCode.ACCESS_DENIED,
      );
    }

    const filePath = join(fileFolder, resourcePath).replace(/\/+/g, '/');

    const onStorageFilePath = join(
      SERVER_FILE_STORAGE_PREFIX,
      filePath,
    ).replace(/\/+/g, '/');

    validateStoragePathIsWithinServerScopeOrThrow({
      onStoragePath: onStorageFilePath,
      fileFolder,
    });

    return { onStorageFilePath, filePath };
  }

  async writeServerFile({
    fileFolder,
    resourcePath,
    contents,
    mimeType,
    applicationRegistrationId,
  }: ServerResourceIdentifier & {
    contents: Buffer | string;
    mimeType: string;
    applicationRegistrationId: string;
  }): Promise<FileEntity> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const { onStorageFilePath, filePath } =
      this.validateAndBuildServerFileStoragePathOrThrow({
        fileFolder,
        resourcePath,
      });

    await driver.writeFile({
      filePath: onStorageFilePath,
      mimeType,
      sourceFile: contents,
    });

    await this.serverFileRepository.upsert(
      {
        path: filePath,
        workspaceId: null,
        size:
          typeof contents === 'string'
            ? Buffer.byteLength(contents)
            : contents.length,
        mimeType,
        applicationRegistrationId,
      },
      {
        conflictPaths: ['path'],
        indexPredicate: '"workspaceId" IS NULL',
      },
    );

    return this.serverFileRepository.findOneByOrFail({
      path: filePath,
      workspaceId: IsNull(),
    });
  }

  async readServerFile({
    fileFolder,
    resourcePath,
  }: ServerResourceIdentifier): Promise<Readable> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const { onStorageFilePath, filePath } =
      this.validateAndBuildServerFileStoragePathOrThrow({
        fileFolder,
        resourcePath,
      });

    const serverFile = await this.serverFileRepository.findOneBy({
      path: filePath,
      workspaceId: IsNull(),
    });

    if (!isDefined(serverFile)) {
      throw new FileStorageException(
        `Server file ${filePath} not found`,
        FileStorageExceptionCode.FILE_NOT_FOUND,
      );
    }

    return driver.readFile({ filePath: onStorageFilePath });
  }

  async readServerFileById(id: string): Promise<Readable> {
    const serverFile = await this.findServerFileByIdOrThrow(id);

    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.readFile({
      filePath: this.buildServerOnStorageFilePath(serverFile),
    });
  }

  checkServerFileExists({
    fileFolder,
    resourcePath,
  }: ServerResourceIdentifier): Promise<boolean> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const { onStorageFilePath } =
      this.validateAndBuildServerFileStoragePathOrThrow({
        fileFolder,
        resourcePath,
      });

    return driver.checkFileExists({ filePath: onStorageFilePath });
  }

  async deleteServerFile({
    fileFolder,
    resourcePath,
  }: ServerResourceIdentifier): Promise<void> {
    const { onStorageFilePath, filePath } =
      this.validateAndBuildServerFileStoragePathOrThrow({
        fileFolder,
        resourcePath,
      });

    await this.deleteServerFileBytesBestEffort(onStorageFilePath);

    await this.serverFileRepository.delete({
      path: filePath,
      workspaceId: IsNull(),
    });
  }

  async deleteByServerFileId(id: string): Promise<void> {
    const serverFile = await this.findServerFileByIdOrThrow(id);

    await this.deleteServerFileBytesBestEffort(
      this.buildServerOnStorageFilePath(serverFile),
    );

    await this.serverFileRepository.delete({
      id,
      workspaceId: IsNull(),
    });
  }

  async deleteByApplicationRegistrationId(
    applicationRegistrationId: string,
  ): Promise<void> {
    const serverFiles = await this.serverFileRepository.findBy({
      applicationRegistrationId,
      workspaceId: IsNull(),
    });

    for (const serverFile of serverFiles) {
      await this.deleteServerFileBytesBestEffort(
        this.buildServerOnStorageFilePath(serverFile),
      );
    }

    await this.serverFileRepository.delete({
      applicationRegistrationId,
      workspaceId: IsNull(),
    });
  }

  private async findServerFileByIdOrThrow(id: string): Promise<FileEntity> {
    const serverFile = await this.serverFileRepository.findOneBy({
      id,
      workspaceId: IsNull(),
    });

    if (!isDefined(serverFile)) {
      throw new FileStorageException(
        `Server file ${id} not found`,
        FileStorageExceptionCode.FILE_NOT_FOUND,
      );
    }

    return serverFile;
  }

  private buildServerOnStorageFilePath(serverFile: FileEntity): string {
    return join(SERVER_FILE_STORAGE_PREFIX, serverFile.path);
  }

  private async deleteServerFileBytesBestEffort(
    onStorageFilePath: string,
  ): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    try {
      await driver.delete({
        folderPath: dirname(onStorageFilePath),
        filename: basename(onStorageFilePath),
      });
    } catch (error) {
      this.logger.warn(
        `Failed to delete server file bytes at ${onStorageFilePath}: ${error}`,
      );
    }
  }
}
