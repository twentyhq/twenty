import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { basename, dirname, join } from 'path';
import { type Readable } from 'stream';

import { type ServerFileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, Repository } from 'typeorm';

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
  applicationRegistrationId: string;
  resourcePath: string;
};

const DELETED_REGISTRATION_FILE_CLEANUP_BATCH_SIZE = 500;

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
  }: ServerResourceIdentifier & {
    contents: Buffer | string;
    mimeType: string;
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

  checkServerFileExists({
    fileFolder,
    applicationRegistrationId,
    resourcePath,
  }: ServerResourceIdentifier): Promise<boolean> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    const { onStorageFilePath } =
      this.validateAndBuildServerFileStoragePathOrThrow({
        fileFolder,
        applicationRegistrationId,
        resourcePath,
      });

    return driver.checkFileExists({ filePath: onStorageFilePath });
  }

  async deleteServerFile({
    fileFolder,
    applicationRegistrationId,
    resourcePath,
  }: ServerResourceIdentifier): Promise<void> {
    const { onStorageFilePath, filePath } =
      this.validateAndBuildServerFileStoragePathOrThrow({
        fileFolder,
        applicationRegistrationId,
        resourcePath,
      });

    await this.deleteServerFileBytesBestEffort(onStorageFilePath);

    await this.serverFileRepository.delete({
      path: filePath,
      workspaceId: IsNull(),
    });
  }

  // Server files of a soft-deleted registration are kept for the grace period
  // so a restored registration gets its assets back; this reclaims the storage
  // of registrations deleted long enough ago. Processed in bounded batches so
  // a large backlog cannot exhaust memory or block the cron for too long.
  async deleteFilesOfRegistrationsDeletedBefore(
    deletedBefore: Date,
  ): Promise<number> {
    let totalDeleted = 0;

    while (true) {
      const serverFiles = await this.serverFileRepository
        .createQueryBuilder('file')
        .withDeleted()
        .innerJoin('file.applicationRegistration', 'applicationRegistration')
        .where('file."deletedAt" IS NULL')
        .andWhere('file."workspaceId" IS NULL')
        .andWhere('"applicationRegistration"."deletedAt" < :deletedBefore', {
          deletedBefore,
        })
        .take(DELETED_REGISTRATION_FILE_CLEANUP_BATCH_SIZE)
        .getMany();

      if (serverFiles.length === 0) {
        break;
      }

      for (const serverFile of serverFiles) {
        await this.deleteServerFileBytesBestEffort(
          this.buildServerOnStorageFilePath(serverFile),
        );
      }

      await this.serverFileRepository.delete({
        id: In(serverFiles.map((serverFile) => serverFile.id)),
      });

      totalDeleted += serverFiles.length;

      if (serverFiles.length < DELETED_REGISTRATION_FILE_CLEANUP_BATCH_SIZE) {
        break;
      }
    }

    return totalDeleted;
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
