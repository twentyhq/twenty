import { Injectable, Logger } from '@nestjs/common';

import * as fs from 'fs/promises';

import { FileFolder } from 'twenty-shared/types';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { type SdkModuleName } from 'src/engine/core-modules/sdk-client/constants/allowed-sdk-modules';
import {
  SdkClientException,
  SdkClientExceptionCode,
} from 'src/engine/core-modules/sdk-client/exceptions/sdk-client.exception';
import { SdkClientGenerationService } from 'src/engine/core-modules/sdk-client/sdk-client-generation.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { streamToBuffer } from 'src/utils/stream-to-buffer';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const SDK_CLIENT_ARCHIVE_NAME = 'twenty-client-sdk.zip';

@Injectable()
export class SdkClientArchiveService {
  private readonly logger = new Logger(SdkClientArchiveService.name);

  constructor(
    private readonly fileStorageService: FileStorageService,
    @InjectWorkspaceScopedRepository(ApplicationEntity)
    private readonly applicationRepository: WorkspaceScopedRepository<ApplicationEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly sdkClientGenerationService: SdkClientGenerationService,
  ) {}

  async downloadAndExtractToPackage({
    workspaceId,
    applicationId,
    applicationUniversalIdentifier,
    targetPackagePath,
  }: {
    workspaceId: string;
    applicationId: string;
    applicationUniversalIdentifier: string;
    targetPackagePath: string;
  }): Promise<void> {
    const archiveBuffer = await this.downloadArchiveBufferOrGenerate({
      workspaceId,
      applicationId,
      applicationUniversalIdentifier,
    });

    await fs.rm(targetPackagePath, { recursive: true, force: true });
    await fs.mkdir(targetPackagePath, { recursive: true });

    const { default: unzipper } = await import('unzipper');
    const directory = await unzipper.Open.buffer(archiveBuffer);

    await directory.extract({ path: targetPackagePath });
  }

  async downloadArchiveBuffer({
    workspaceId,
    applicationId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationId: string;
    applicationUniversalIdentifier: string;
  }): Promise<Buffer> {
    return this.downloadArchiveBufferOrGenerate({
      workspaceId,
      applicationId,
      applicationUniversalIdentifier,
    });
  }

  async getClientModuleFromArchive({
    workspaceId,
    applicationId,
    applicationUniversalIdentifier,
    moduleName,
  }: {
    workspaceId: string;
    applicationId: string;
    applicationUniversalIdentifier: string;
    moduleName: SdkModuleName;
  }): Promise<Buffer> {
    const filePath = `dist/${moduleName}.mjs`;

    const archiveBuffer = await this.downloadArchiveBufferOrGenerate({
      workspaceId,
      applicationId,
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
      workspaceId,
      { id: applicationId },
      { isSdkLayerStale: false },
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatApplicationMaps',
    ]);
  }

  private async downloadArchiveBufferOrGenerate({
    workspaceId,
    applicationId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationId: string;
    applicationUniversalIdentifier: string;
  }): Promise<Buffer> {
    try {
      const stream = await this.fileStorageService.readFile({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.GeneratedSdkClient,
        resourcePath: SDK_CLIENT_ARCHIVE_NAME,
      });

      return await streamToBuffer(stream);
    } catch (error) {
      if (
        !(error instanceof FileStorageException) ||
        error.code !== FileStorageExceptionCode.FILE_NOT_FOUND
      ) {
        throw error;
      }
    }

    this.logger.warn(
      `SDK client archive missing for application "${applicationUniversalIdentifier}" in workspace "${workspaceId}", generating on-the-fly`,
    );

    return this.sdkClientGenerationService.generateSdkClientForApplication({
      workspaceId,
      applicationId,
      applicationUniversalIdentifier,
      trigger: 'missing-archive',
    });
  }
}
