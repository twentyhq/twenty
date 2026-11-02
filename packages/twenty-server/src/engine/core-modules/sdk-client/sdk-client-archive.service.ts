import { Injectable, Logger } from '@nestjs/common';

import * as fs from 'fs/promises';
import { createHash } from 'crypto';
import {
  decodeFrontComponentTypeReferences,
  encodeFrontComponentTypeReferences,
} from 'twenty-shared/front-component-build';
import { isDefined } from 'twenty-shared/utils';
import { readLruEntry, writeLruEntry } from 'src/utils/lru-map.util';

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
const SDK_TYPE_REFERENCES_CACHE_ENTRIES = 8;
const SDK_TYPE_REFERENCES_CACHE_ENTRY_BYTES = 1024 * 1024;

@Injectable()
export class SdkClientArchiveService {
  private readonly logger = new Logger(SdkClientArchiveService.name);
  private readonly typeReferencesCache = new Map<
    string,
    { checksum: string; content: Buffer }
  >();

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

  async getClientTypeReferences(params: {
    workspaceId: string;
    applicationId: string;
    applicationUniversalIdentifier: string;
  }): Promise<Record<string, string>> {
    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(params.workspaceId, [
        'flatApplicationMaps',
      ]);
    const checksum =
      flatApplicationMaps.byId[params.applicationId]?.sdkClientCoreChecksum;
    const key = `${params.workspaceId}:${params.applicationId}`;
    const cached = readLruEntry({ map: this.typeReferencesCache, key });
    if (isDefined(checksum) && cached?.checksum === checksum) {
      return decodeFrontComponentTypeReferences(cached.content);
    }
    const archiveBuffer = await this.downloadArchiveBufferOrGenerate(params);
    const { default: unzipper } = await import('unzipper');
    const directory = await unzipper.Open.buffer(archiveBuffer);
    const files = await Promise.all(
      directory.files
        .filter(
          (file) =>
            /\.[cm]?ts$/.test(file.path) || file.path.endsWith('package.json'),
        )
        .map(
          async (file) =>
            [
              `/node_modules/twenty-client-sdk/${file.path.replace(/^\.\//, '')}`,
              (await file.buffer()).toString(),
            ] as const,
        ),
    );
    const references = Object.fromEntries(files);
    const core = directory.files.find(
      (file) =>
        file.path === 'dist/core.mjs' || file.path === './dist/core.mjs',
    );
    if (
      isDefined(checksum) &&
      isDefined(core) &&
      createHash('sha256')
        .update(await core.buffer())
        .digest('hex') === checksum
    ) {
      const content = encodeFrontComponentTypeReferences(references);
      if (content.byteLength <= SDK_TYPE_REFERENCES_CACHE_ENTRY_BYTES) {
        writeLruEntry({
          map: this.typeReferencesCache,
          key,
          value: { checksum, content },
          maxEntries: SDK_TYPE_REFERENCES_CACHE_ENTRIES,
        });
      }
    }
    return references;
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
