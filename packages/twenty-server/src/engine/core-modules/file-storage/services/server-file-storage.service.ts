import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { basename, dirname, join } from 'path';
import { type Readable } from 'stream';

import { type ServerFileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, Like, Repository } from 'typeorm';

import { SERVER_FILE_STORAGE_PREFIX } from 'src/engine/core-modules/file-storage/constants/server-file-storage-prefix.constant';
import { FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { validateFilePath } from 'src/engine/core-modules/file-storage/utils/validate-file-path.util';
import { validateStoragePathIsWithinServerScopeOrThrow } from 'src/engine/core-modules/file-storage/utils/validate-storage-path-is-within-server-scope-or-throw.util';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { type FileSettings } from 'src/engine/core-modules/file/types/file-settings.type';

export type ServerResourceIdentifier = {
  fileFolder: ServerFileFolder;
  applicationRegistrationId: string;
  resourcePath: string;
};

export type ServerFileIdentifier = {
  fileFolder: ServerFileFolder;
  applicationRegistrationId: string;
  fileId: string;
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
    applicationRegistrationId,
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

    const filePath = join(
      fileFolder,
      applicationRegistrationId,
      resourcePath,
    ).replace(/\/+/g, '/');

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
    applicationRegistrationId,
    resourcePath,
    contents,
    mimeType,
    fileId,
    settings,
  }: ServerResourceIdentifier & {
    contents: Buffer | string;
    mimeType: string;
    fileId?: string;
    settings?: FileSettings;
  }): Promise<FileEntity> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const { onStorageFilePath, filePath } =
      this.validateAndBuildServerFileStoragePathOrThrow({
        fileFolder,
        applicationRegistrationId,
        resourcePath,
      });

    await driver.writeFile({
      filePath: onStorageFilePath,
      mimeType,
      sourceFile: contents,
    });

    await this.serverFileRepository.upsert(
      {
        ...(isDefined(fileId) ? { id: fileId } : {}),
        path: filePath,
        workspaceId: null,
        size:
          typeof contents === 'string'
            ? Buffer.byteLength(contents)
            : contents.length,
        mimeType,
        applicationRegistrationId,
        ...(isDefined(settings) ? { settings } : {}),
      },
      {
        conflictPaths: ['applicationRegistrationId', 'path'],
      },
    );

    return this.serverFileRepository.findOneByOrFail({
      applicationRegistrationId,
      path: filePath,
      workspaceId: IsNull(),
    });
  }

  async readServerFile({
    fileFolder,
    applicationRegistrationId,
    resourcePath,
  }: ServerResourceIdentifier): Promise<{
    stream: Readable;
    mimeType: string;
  }> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const { onStorageFilePath } =
      this.validateAndBuildServerFileStoragePathOrThrow({
        fileFolder,
        applicationRegistrationId,
        resourcePath,
      });

    const serverFile = await this.findServerFile({
      fileFolder,
      applicationRegistrationId,
      resourcePath,
    });

    if (!isDefined(serverFile)) {
      throw new FileStorageException(
        `Server file ${fileFolder}/${applicationRegistrationId}/${resourcePath} not found`,
        FileStorageExceptionCode.FILE_NOT_FOUND,
      );
    }

    const stream = await driver.readFile({ filePath: onStorageFilePath });

    return { stream, mimeType: serverFile.mimeType };
  }

  async findServerFile({
    fileFolder,
    applicationRegistrationId,
    resourcePath,
  }: ServerResourceIdentifier): Promise<FileEntity | null> {
    const { filePath } = this.validateAndBuildServerFileStoragePathOrThrow({
      fileFolder,
      applicationRegistrationId,
      resourcePath,
    });

    return this.serverFileRepository.findOneBy({
      applicationRegistrationId,
      path: filePath,
      workspaceId: IsNull(),
    });
  }

  async findServerFilesByIds({
    fileFolder,
    applicationRegistrationId,
    fileIds,
  }: Omit<ServerFileIdentifier, 'fileId'> & {
    fileIds: string[];
  }): Promise<FileEntity[]> {
    if (fileIds.length === 0) {
      return [];
    }

    return this.serverFileRepository.find({
      where: {
        id: In(fileIds),
        applicationRegistrationId,
        workspaceId: IsNull(),
        path: Like(`${fileFolder}/${applicationRegistrationId}/%`),
      },
    });
  }

  async readServerFileById(
    serverFileIdentifier: ServerFileIdentifier,
  ): Promise<{ stream: Readable; mimeType: string }> {
    const serverFile = await this.findServerFileById(serverFileIdentifier);

    if (!isDefined(serverFile)) {
      throw new FileStorageException(
        `Server file ${serverFileIdentifier.fileId} of registration ${serverFileIdentifier.applicationRegistrationId} not found`,
        FileStorageExceptionCode.FILE_NOT_FOUND,
      );
    }

    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const stream = await driver.readFile({
      filePath: this.buildServerOnStorageFilePath(serverFile),
    });

    return { stream, mimeType: serverFile.mimeType };
  }

  async updateServerFilesSettings({
    fileFolder,
    applicationRegistrationId,
    fileIds,
    settings,
  }: Omit<ServerFileIdentifier, 'fileId'> & {
    fileIds: string[];
    settings: FileSettings;
  }): Promise<void> {
    if (fileIds.length === 0) {
      return;
    }

    await this.serverFileRepository.update(
      {
        id: In(fileIds),
        applicationRegistrationId,
        workspaceId: IsNull(),
        path: Like(`${fileFolder}/${applicationRegistrationId}/%`),
      },
      { settings },
    );
  }

  async deleteServerFileById(
    serverFileIdentifier: ServerFileIdentifier,
  ): Promise<void> {
    const serverFile = await this.findServerFileById(serverFileIdentifier);

    if (!isDefined(serverFile)) {
      return;
    }

    await this.deleteServerFileBytesBestEffort(
      this.buildServerOnStorageFilePath(serverFile),
    );

    await this.serverFileRepository.delete({
      id: serverFile.id,
      workspaceId: IsNull(),
    });
  }

  private async findServerFileById({
    fileId,
    ...scope
  }: ServerFileIdentifier): Promise<FileEntity | null> {
    const [serverFile] = await this.findServerFilesByIds({
      ...scope,
      fileIds: [fileId],
    });

    return serverFile ?? null;
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
