import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { readFile } from 'fs/promises';
import { join } from 'path';

import { generateCoreClientFromSchema } from 'twenty-client-sdk/generate';
import { FileFolder } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { TemporaryDirManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/temporary-dir-manager';

const SDK_CLIENT_FILES = ['index.mjs', 'index.cjs', 'package.json'] as const;

@Injectable()
export class SdkClientGenerationService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {}

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
      const outputPath = join(sourceTemporaryDir, 'generated-core');

      await generateCoreClientFromSchema({ schema, outputPath });

      await Promise.all(
        SDK_CLIENT_FILES.map(async (fileName) => {
          const content = await readFile(join(outputPath, fileName));

          await this.fileStorageService.writeFile({
            workspaceId,
            applicationUniversalIdentifier,
            fileFolder: FileFolder.GeneratedSdkClient,
            resourcePath: fileName,
            sourceFile: content,
            mimeType: 'application/javascript',
            settings: { isTemporaryFile: false, toDelete: false },
          });
        }),
      );

      await this.applicationRepository.update(
        { id: applicationId, workspaceId },
        { isSdkLayerStale: true },
      );
    } finally {
      await temporaryDirManager.clean();
    }
  }

  async downloadClientToLayer({
    workspaceId,
    applicationUniversalIdentifier,
    layerClientSdkDistPath,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    layerClientSdkDistPath: string;
  }): Promise<void> {
    await Promise.all(
      SDK_CLIENT_FILES.map((fileName) => {
        const targetFileName =
          fileName === 'index.mjs'
            ? 'core.mjs'
            : fileName === 'index.cjs'
              ? 'core.cjs'
              : fileName;

        return this.fileStorageService.downloadFile({
          workspaceId,
          applicationUniversalIdentifier,
          fileFolder: FileFolder.GeneratedSdkClient,
          resourcePath: fileName,
          localPath: join(layerClientSdkDistPath, targetFileName),
        });
      }),
    );
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
