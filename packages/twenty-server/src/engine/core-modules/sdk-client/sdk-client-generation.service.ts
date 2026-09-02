import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { createHash } from 'crypto';
import * as fs from 'fs/promises';
import { printSchema } from 'graphql';
import path, { join } from 'path';

import { replaceCoreClient } from 'twenty-client-sdk/generate';
import { FileFolder } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { WorkspaceSchemaFactory } from 'src/engine/api/graphql/workspace-schema.factory';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { createZipFile } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/create-zip-file';
import { TemporaryDirManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/temporary-dir-manager';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { type SdkModuleName } from 'src/engine/core-modules/sdk-client/constants/allowed-sdk-modules';
import { SDK_CLIENT_PACKAGE_DIRNAME } from 'src/engine/core-modules/sdk-client/constants/sdk-client-package-dirname';
import {
  SdkClientException,
  SdkClientExceptionCode,
} from 'src/engine/core-modules/sdk-client/exceptions/sdk-client.exception';
import {
  GENERATE_SDK_CLIENT_JOB_NAME,
  type GenerateSdkClientJobData,
} from 'src/engine/core-modules/sdk-client/jobs/generate-sdk-client.job-constants';
import { type SdkClientGenerationTrigger } from 'src/engine/core-modules/sdk-client/types/sdk-client-generation-trigger.type';
import { fromWorkspaceEntityToFlat } from 'src/engine/core-modules/workspace/utils/from-workspace-entity-to-flat.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const SDK_CLIENT_ARCHIVE_NAME = 'twenty-client-sdk.zip';
const SDK_CLIENT_GENERATION_RETRY_LIMIT = 3;

@Injectable()
export class SdkClientGenerationService {
  private readonly logger = new Logger(SdkClientGenerationService.name);

  constructor(
    private readonly fileStorageService: FileStorageService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workspaceSchemaFactory: WorkspaceSchemaFactory,
    private readonly applicationService: ApplicationService,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly metricsService: MetricsService,
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
          this.enqueueSdkClientGenerationForApplication({
            workspaceId,
            applicationId: application.id,
            applicationUniversalIdentifier: application.universalIdentifier,
            trigger: 'workspace-activation',
          }),
      ),
    );
  }

  private async enqueueSdkClientGenerationForApplication({
    workspaceId,
    applicationId,
    applicationUniversalIdentifier,
    trigger,
  }: {
    workspaceId: string;
    applicationId: string;
    applicationUniversalIdentifier: string;
    trigger: SdkClientGenerationTrigger;
  }): Promise<void> {
    await this.messageQueueService.add<GenerateSdkClientJobData>(
      GENERATE_SDK_CLIENT_JOB_NAME,
      {
        workspaceId,
        applicationId,
        applicationUniversalIdentifier,
        trigger,
      },
      {
        id: `sdk-client:${workspaceId}:${applicationId}`,
        retryLimit: SDK_CLIENT_GENERATION_RETRY_LIMIT,
      },
    );
  }

  async generateSdkClientForApplication({
    workspaceId,
    applicationId,
    applicationUniversalIdentifier,
    trigger = 'unknown',
  }: {
    workspaceId: string;
    applicationId: string;
    applicationUniversalIdentifier: string;
    trigger?: SdkClientGenerationTrigger;
  }): Promise<Buffer> {
    const generationStart = performance.now();

    try {
      const workspaceEntity = await this.workspaceRepository.findOneByOrFail({
        id: workspaceId,
      });

      const graphqlSchema =
        await this.workspaceSchemaFactory.createGraphQLSchema(
          fromWorkspaceEntityToFlat(workspaceEntity),
          applicationId,
        );

      const archiveBuffer = await this.generateAndStore({
        workspaceId,
        applicationId,
        applicationUniversalIdentifier,
        schema: printSchema(graphqlSchema),
      });

      const generationDurationMs = performance.now() - generationStart;

      this.metricsService.incrementCounterBy({
        key: MetricsKeys.SdkClientGenerationSucceeded,
        amount: 1,
        attributes: { trigger },
      });
      this.metricsService.recordHistogram({
        key: MetricsKeys.SdkClientGenerationDurationMs,
        value: generationDurationMs,
        unit: 'ms',
        attributes: { trigger },
      });

      this.logger.log(
        `Generated SDK client for application ${applicationUniversalIdentifier} (trigger: ${trigger})`,
      );

      return archiveBuffer;
    } catch (error) {
      this.metricsService.incrementCounterBy({
        key: MetricsKeys.SdkClientGenerationFailed,
        amount: 1,
        attributes: { trigger },
      });

      throw error;
    }
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

      const sdkClientCoreChecksum = await this.computeSdkModuleChecksum(
        tempPackageRoot,
        'core',
      );

      const archivePath = join(sourceTemporaryDir, SDK_CLIENT_ARCHIVE_NAME);

      await createZipFile(tempPackageRoot, archivePath);

      const archiveBuffer = await fs.readFile(archivePath);

      await this.fileStorageService.writeFile({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.GeneratedSdkClient,
        resourcePath: SDK_CLIENT_ARCHIVE_NAME,
        sourceFile: archiveBuffer,
        settings: { isTemporaryFile: false, toDelete: false },
      });

      await this.storeSdkClientCoreChecksum({
        workspaceId,
        applicationId,
        applicationUniversalIdentifier,
        sdkClientCoreChecksum,
      });

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

  private async storeSdkClientCoreChecksum({
    workspaceId,
    applicationId,
    applicationUniversalIdentifier,
    sdkClientCoreChecksum,
  }: {
    workspaceId: string;
    applicationId: string;
    applicationUniversalIdentifier: string;
    sdkClientCoreChecksum: string;
  }): Promise<void> {
    try {
      await this.applicationService.update(applicationId, {
        isSdkLayerStale: true,
        sdkClientCoreChecksum,
        workspaceId,
      });
    } catch (error) {
      if (
        error instanceof ApplicationException &&
        error.code === ApplicationExceptionCode.APPLICATION_NOT_FOUND
      ) {
        this.logger.warn(
          `Skipped SDK client checksum write for application ${applicationUniversalIdentifier} in workspace ${workspaceId}: the application no longer exists`,
        );

        return;
      }

      throw error;
    }
  }

  // sha-256 (not md5) so the renderer can verify cached bundles against the URL
  // checksum with WebCrypto, which has no md5 support
  private async computeSdkModuleChecksum(
    tempPackageRoot: string,
    moduleName: SdkModuleName,
  ): Promise<string> {
    const moduleBuffer = await fs.readFile(
      join(tempPackageRoot, 'dist', `${moduleName}.mjs`),
    );

    return createHash('sha256').update(moduleBuffer).digest('hex');
  }
}
