import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { createWriteStream } from 'fs';
import * as fs from 'fs/promises';
import { join } from 'path';
import { type Readable } from 'stream';
import { pipeline } from 'stream/promises';

import { FileFolder } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { TemporaryDirManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/temporary-dir-manager';
import { type SdkModuleName } from 'src/engine/core-modules/sdk-client/constants/allowed-sdk-modules';
import {
  SdkClientException,
  SdkClientExceptionCode,
} from 'src/engine/core-modules/sdk-client/exceptions/sdk-client.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

const SDK_CLIENT_ARCHIVE_NAME = 'twenty-client-sdk.zip';

@Injectable()
export class SdkClientArchiveService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async downloadAndExtractToPackage({
    workspaceId,
    applicationUniversalIdentifier,
    targetPackagePath,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    targetPackagePath: string;
  }): Promise<void> {
    const temporaryDirManager = new TemporaryDirManager();

    try {
      const { sourceTemporaryDir } = await temporaryDirManager.init();
      const archivePath = join(sourceTemporaryDir, SDK_CLIENT_ARCHIVE_NAME);

      const archiveStream = await this.readArchiveStream({
        workspaceId,
        applicationUniversalIdentifier,
      });

      await pipeline(archiveStream, createWriteStream(archivePath));

      await fs.rm(targetPackagePath, { recursive: true, force: true });
      await fs.mkdir(targetPackagePath, { recursive: true });

      const { default: unzipper } = await import('unzipper');
      const directory = await unzipper.Open.file(archivePath);

      await directory.extract({ path: targetPackagePath });
    } finally {
      await temporaryDirManager.clean();
    }
  }

  async downloadArchiveBuffer({
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }): Promise<Buffer> {
    const archiveStream = await this.readArchiveStream({
      workspaceId,
      applicationUniversalIdentifier,
    });

    return streamToBuffer(archiveStream);
  }

  async getClientModuleFromArchive({
    workspaceId,
    applicationUniversalIdentifier,
    moduleName,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    moduleName: SdkModuleName;
  }): Promise<Buffer> {
    const filePath = `dist/${moduleName}.mjs`;

    const archiveBuffer = await this.downloadArchiveBuffer({
      workspaceId,
      applicationUniversalIdentifier,
    });

    const { default: unzipper } = await import('unzipper');
    const directory = await unzipper.Open.buffer(archiveBuffer);

    const entry = directory.files.find(
      (file) => file.path === filePath || file.path === `./${filePath}`,
    );

    if (!entry) {
      throw new SdkClientException(
        `Module "${moduleName}" not found in SDK client archive for application "${applicationUniversalIdentifier}" in workspace "${workspaceId}"`,
        SdkClientExceptionCode.FILE_NOT_FOUND_IN_ARCHIVE,
      );
    }

    return entry.buffer();
  }

  async markSdkLayerFresh({
    applicationId,
    workspaceId,
  }: {
    applicationId: string;
    workspaceId: string;
  }): Promise<void> {
    await this.applicationRepository.update(
      { id: applicationId, workspaceId },
      { isSdkLayerStale: false },
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatApplicationMaps',
    ]);
  }

  private async readArchiveStream({
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }): Promise<Readable> {
    try {
      return await this.fileStorageService.readFile({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.GeneratedSdkClient,
        resourcePath: SDK_CLIENT_ARCHIVE_NAME,
      });
    } catch (error) {
      if (
        error instanceof FileStorageException &&
        error.code === FileStorageExceptionCode.FILE_NOT_FOUND
      ) {
        throw new SdkClientException(
          `SDK client archive "${SDK_CLIENT_ARCHIVE_NAME}" not found for application "${applicationUniversalIdentifier}" in workspace "${workspaceId}".`,
          SdkClientExceptionCode.ARCHIVE_NOT_FOUND,
        );
      }

      throw error;
    }
  }
}
