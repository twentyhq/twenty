import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as fs from 'fs/promises';
import { printSchema } from 'graphql';
import path, { join } from 'path';

import { replaceCoreClient } from 'twenty-client-sdk/generate';
import { FileFolder } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { WorkspaceSchemaFactory } from 'src/engine/api/graphql/workspace-schema.factory';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { createZipFile } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/create-zip-file';
import { TemporaryDirManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/temporary-dir-manager';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { SDK_CLIENT_PACKAGE_DIRNAME } from 'src/engine/core-modules/sdk-client/constants/sdk-client-package-dirname';
import {
  SdkClientException,
  SdkClientExceptionCode,
} from 'src/engine/core-modules/sdk-client/exceptions/sdk-client.exception';
import {
  GENERATE_SDK_CLIENT_JOB_NAME,
  type GenerateSdkClientJobData,
} from 'src/engine/core-modules/sdk-client/jobs/generate-sdk-client.job-constants';
import { fromWorkspaceEntityToFlat } from 'src/engine/core-modules/workspace/utils/from-workspace-entity-to-flat.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const SDK_CLIENT_ARCHIVE_NAME = 'twenty-client-sdk.zip';
const SDK_CLIENT_GENERATION_RETRY_LIMIT = 3;

@Injectable()
export class SdkClientGenerationService {
  private readonly logger = new Logger(SdkClientGenerationService.name);

  constructor(
    private readonly fileStorageService: FileStorageService,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceSchemaFactory: WorkspaceSchemaFactory,
    private readonly applicationService: ApplicationService,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async enqueueSdkClientGenerationForWorkspace(
    workspaceId: string,
  ): Promise<void> {
    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    await Promise.all(
      [twentyStandardFlatApplication, workspaceCustomFlatApplication].map(
        (application) =>
          this.messageQueueService.add<GenerateSdkClientJobData>(
            GENERATE_SDK_CLIENT_JOB_NAME,
            {
              workspaceId,
              applicationId: application.id,
              applicationUniversalIdentifier: application.universalIdentifier,
            },
            {
              id: `sdk-client:${workspaceId}:${application.id}`,
              retryLimit: SDK_CLIENT_GENERATION_RETRY_LIMIT,
            },
          ),
      ),
    );
  }

  async generateSdkClientForApplication({
    workspaceId,
    applicationId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationId: string;
    applicationUniversalIdentifier: string;
  }): Promise<Buffer> {
    const workspaceEntity = await this.workspaceRepository.findOneByOrFail({
      id: workspaceId,
    });

    const graphqlSchema = await this.workspaceSchemaFactory.createGraphQLSchema(
      fromWorkspaceEntityToFlat(workspaceEntity),
      applicationId,
    );

    const archiveBuffer = await this.generateAndStore({
      workspaceId,
      applicationId,
      applicationUniversalIdentifier,
      schema: printSchema(graphqlSchema),
    });

    this.logger.log(
      `Generated SDK client for application ${applicationUniversalIdentifier}`,
    );

    return archiveBuffer;
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
  }): Promise<Buffer> {
    const temporaryDirManager = new TemporaryDirManager();

    try {
      const { sourceTemporaryDir } = await temporaryDirManager.init();

      const tempPackageRoot = join(sourceTemporaryDir, 'twenty-client-sdk');

      await fs.cp(SDK_CLIENT_PACKAGE_DIRNAME, tempPackageRoot, {
        recursive: true,
        filter: (source) => {
          const relativePath = path.relative(
            SDK_CLIENT_PACKAGE_DIRNAME,
            source,
          );

          return (
            !relativePath.includes('node_modules') &&
            !relativePath.startsWith('src')
          );
        },
      });

      await replaceCoreClient({ packageRoot: tempPackageRoot, schema });

      const archivePath = join(sourceTemporaryDir, SDK_CLIENT_ARCHIVE_NAME);

      await createZipFile(tempPackageRoot, archivePath);

      const archiveBuffer = await fs.readFile(archivePath);

      await this.fileStorageService.writeFile({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.GeneratedSdkClient,
        resourcePath: SDK_CLIENT_ARCHIVE_NAME,
        sourceFile: archiveBuffer,
        mimeType: 'application/zip',
        settings: { isTemporaryFile: false, toDelete: false },
      });

      await this.applicationRepository.update(
        { id: applicationId, workspaceId },
        { isSdkLayerStale: true },
      );

      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatApplicationMaps',
      ]);

      return archiveBuffer;
    } catch (error) {
      throw new SdkClientException(
        `Failed to generate SDK client for application "${applicationUniversalIdentifier}" in workspace "${workspaceId}": ${error instanceof Error ? error.message : String(error)}`,
        SdkClientExceptionCode.GENERATION_FAILED,
      );
    } finally {
      await temporaryDirManager.clean();
    }
  }
}
