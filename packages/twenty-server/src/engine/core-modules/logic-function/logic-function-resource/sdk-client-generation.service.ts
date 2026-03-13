import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { createWriteStream } from 'fs';
import * as fs from 'fs/promises';
import { join } from 'path';
import { type Readable } from 'stream';
import { pipeline } from 'stream/promises';

import { replaceCoreClient } from 'twenty-client-sdk/generate';
import { FileFolder } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { createZipFile } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/create-zip-file';
import { SDK_CLIENT_PACKAGE_DIRNAME } from 'src/engine/core-modules/logic-function/logic-function-resource/constants/sdk-client-package-dirname';
import {
  SdkClientGenerationException,
  SdkClientGenerationExceptionCode,
} from 'src/engine/core-modules/logic-function/logic-function-resource/exceptions/sdk-client-generation.exception';
import { TemporaryDirManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/temporary-dir-manager';
import { streamToBuffer } from 'src/utils/stream-to-buffer';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const SDK_CLIENT_ARCHIVE_NAME = 'twenty-client-sdk.zip';

@Injectable()
export class SdkClientGenerationService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  // Copies the stub twenty-client-sdk package, regenerates core.mjs/core.cjs
  // with the application-scoped schema, archives the full package (like an
  // npm publish), and uploads the archive to file storage.
  async generateAndStore({
    workspaceId,
    applicationId,
    applicationUniversalIdentifier,
    schema,
  }: {
    workspaceId: string;
    applicationId: string;
    applicationUniversalIdentifier: string;
    schema: string;
  }): Promise<void> {
    const temporaryDirManager = new TemporaryDirManager();

    try {
      const { sourceTemporaryDir } = await temporaryDirManager.init();

      const tempPackageRoot = join(sourceTemporaryDir, 'twenty-client-sdk');

      await fs.cp(SDK_CLIENT_PACKAGE_DIRNAME, tempPackageRoot, {
        recursive: true,
        filter: (source) =>
          !source.includes('node_modules') && !source.includes('/src'),
      });

      await replaceCoreClient({ packageRoot: tempPackageRoot, schema });

      const archivePath = join(sourceTemporaryDir, SDK_CLIENT_ARCHIVE_NAME);

      await createZipFile(tempPackageRoot, archivePath);

      await this.fileStorageService.writeFile({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.GeneratedSdkClient,
        resourcePath: SDK_CLIENT_ARCHIVE_NAME,
        sourceFile: await fs.readFile(archivePath),
        mimeType: 'application/zip',
        settings: { isTemporaryFile: false, toDelete: false },
      });

      await this.applicationRepository.update(
        { id: applicationId, workspaceId },
        { isSdkLayerStale: true },
      );
    } catch (error) {
      throw new SdkClientGenerationException(
        `Failed to generate SDK client for application "${applicationUniversalIdentifier}" in workspace "${workspaceId}": ${error instanceof Error ? error.message : String(error)}`,
        SdkClientGenerationExceptionCode.GENERATION_FAILED,
      );
    } finally {
      await temporaryDirManager.clean();
    }
  }

  // Downloads the archive from file storage and extracts the full
  // twenty-client-sdk package into targetPackagePath.
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

  // Downloads the archive as a raw Buffer (for consumers that need
  // the zip itself, e.g. Lambda layer publishing).
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

  // Reads a single file from the generated SDK archive (e.g. 'dist/core.mjs').
  // Used to serve individual SDK modules to the frontend worker.
  async readFileFromArchive({
    workspaceId,
    applicationUniversalIdentifier,
    filePath,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    filePath: string;
  }): Promise<Buffer> {
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
      throw new SdkClientGenerationException(
        `File "${filePath}" not found in SDK client archive for application "${applicationUniversalIdentifier}" in workspace "${workspaceId}"`,
        SdkClientGenerationExceptionCode.FILE_NOT_FOUND_IN_ARCHIVE,
      );
    }

    return entry.buffer();
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
        throw new SdkClientGenerationException(
          `SDK client archive "${SDK_CLIENT_ARCHIVE_NAME}" not found for application "${applicationUniversalIdentifier}" in workspace "${workspaceId}". ` +
            `Run generateAndStore() first (e.g. by re-installing the application).`,
          SdkClientGenerationExceptionCode.ARCHIVE_NOT_FOUND,
        );
      }

      throw error;
    }
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
}
