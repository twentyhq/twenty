import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { createWriteStream } from 'fs';
import * as fs from 'fs/promises';
import { join } from 'path';
import { type Readable } from 'stream';
import { pipeline } from 'stream/promises';

import { printSchema } from 'graphql';
import { replaceCoreClient } from 'twenty-client-sdk/generate';
import { FileFolder } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { WorkspaceSchemaFactory } from 'src/engine/api/graphql/workspace-schema.factory';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { createZipFile } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/create-zip-file';
import { TemporaryDirManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/temporary-dir-manager';
import { SDK_CLIENT_PACKAGE_DIRNAME } from 'src/engine/core-modules/logic-function/logic-function-resource/constants/sdk-client-package-dirname';
import {
  SdkClientGenerationException,
  SdkClientGenerationExceptionCode,
} from 'src/engine/core-modules/logic-function/logic-function-resource/exceptions/sdk-client-generation.exception';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

const SDK_CLIENT_ARCHIVE_NAME = 'twenty-client-sdk.zip';

@Injectable()
export class SdkClientGenerationService {
  private readonly logger = new Logger(SdkClientGenerationService.name);

  constructor(
    private readonly fileStorageService: FileStorageService,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceSchemaFactory: WorkspaceSchemaFactory,
  ) {}

  // Introspects the application-scoped GraphQL schema and (re)generates
  // the SDK client archive in storage. Sets isSdkLayerStale = true so
  // drivers re-download on next execution.
  async generateApplicationClient({
    workspaceId,
    applicationId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationId: string;
    applicationUniversalIdentifier: string;
  }): Promise<void> {
    const graphqlSchema = await this.workspaceSchemaFactory.createGraphQLSchema(
      { id: workspaceId } as WorkspaceEntity,
      applicationId,
    );

    await this.generateAndStore({
      workspaceId,
      applicationId,
      applicationUniversalIdentifier,
      schema: printSchema(graphqlSchema),
    });
  }

  private async generateAndStore({
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

  // Ensures the SDK client archive exists in storage for this application.
  // If missing (first creation, disk wipe, etc.), introspects the schema
  // and generates the archive on-demand.
  async ensureArchiveExists({
    workspaceId,
    applicationId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationId: string;
    applicationUniversalIdentifier: string;
  }): Promise<void> {
    const exists = await this.archiveExists({
      workspaceId,
      applicationUniversalIdentifier,
    });

    if (exists) {
      return;
    }

    this.logger.log(
      `SDK client archive missing for application "${applicationUniversalIdentifier}" in workspace "${workspaceId}", generating on-demand`,
    );

    await this.generateApplicationClient({
      workspaceId,
      applicationId,
      applicationUniversalIdentifier,
    });
  }

  private async archiveExists({
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }): Promise<boolean> {
    try {
      await this.fileStorageService.readFile({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.GeneratedSdkClient,
        resourcePath: SDK_CLIENT_ARCHIVE_NAME,
      });

      return true;
    } catch (error) {
      if (
        error instanceof FileStorageException &&
        error.code === FileStorageExceptionCode.FILE_NOT_FOUND
      ) {
        return false;
      }

      throw error;
    }
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
          `SDK client archive "${SDK_CLIENT_ARCHIVE_NAME}" not found for application "${applicationUniversalIdentifier}" in workspace "${workspaceId}".`,
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
