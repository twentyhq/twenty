import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { createReadStream } from 'fs';
import * as fs from 'fs/promises';
import { join, resolve } from 'path';

import { replaceCoreClient } from 'twenty-client-sdk/generate';
import { FileFolder } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { createZipFile } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/create-zip-file';
import { TemporaryDirManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/temporary-dir-manager';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

const SDK_CLIENT_ARCHIVE_NAME = 'twenty-client-sdk-dist.zip';

const getStubPackageRoot = (): string => {
  const coreEntryPath = require.resolve('twenty-client-sdk/core');

  return resolve(coreEntryPath, '..', '..');
};

@Injectable()
export class SdkClientGenerationService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {}

  // Copies the stub twenty-client-sdk dist, regenerates core.mjs/core.cjs
  // with the application-scoped schema, archives the whole dist, and
  // uploads the single archive to file storage.
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

      const stubPackageRoot = getStubPackageRoot();
      const tempPackageRoot = join(sourceTemporaryDir, 'twenty-client-sdk');

      await fs.cp(stubPackageRoot, tempPackageRoot, { recursive: true });

      await replaceCoreClient({ packageRoot: tempPackageRoot, schema });

      const archivePath = join(sourceTemporaryDir, SDK_CLIENT_ARCHIVE_NAME);

      await createZipFile(join(tempPackageRoot, 'dist'), archivePath);

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
    } finally {
      await temporaryDirManager.clean();
    }
  }

  // Downloads the archive from file storage and extracts it into the
  // target twenty-client-sdk package directory, replacing the stub dist.
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

      const archiveStream = await this.fileStorageService.readFile({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.GeneratedSdkClient,
        resourcePath: SDK_CLIENT_ARCHIVE_NAME,
      });

      await fs.writeFile(archivePath, await streamToBuffer(archiveStream));

      const distPath = join(targetPackagePath, 'dist');

      await fs.rm(distPath, { recursive: true, force: true });

      const { default: unzipper } = await import('unzipper');

      await new Promise<void>((resolve, reject) => {
        createReadStream(archivePath)
          .pipe(unzipper.Extract({ path: distPath }))
          .on('close', resolve)
          .on('error', reject);
      });
    } finally {
      await temporaryDirManager.clean();
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
  }
}
