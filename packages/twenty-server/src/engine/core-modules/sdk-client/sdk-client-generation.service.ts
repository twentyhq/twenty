import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { buildSchema, printSchema } from 'graphql';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { WorkspaceGraphqlSchemaSDLService } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/workspace-graphql-schema-sdl.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { SDK_CLIENT_ARCHIVE_NAME } from 'src/engine/core-modules/sdk-client/constants/sdk-client-archive-name';
import { SDK_CLIENT_ARCHIVE_SIZE_BUCKET_BOUNDARIES_BYTES } from 'src/engine/core-modules/sdk-client/constants/sdk-client-archive-size-bucket-boundaries';
import {
  SdkClientException,
  SdkClientExceptionCode,
} from 'src/engine/core-modules/sdk-client/exceptions/sdk-client.exception';
import { SdkClientArchiveBuilderFactory } from 'src/engine/core-modules/sdk-client/sdk-client-archive-builder.factory';
import { computeSdkClientCoreChecksumFromArchive } from 'src/engine/core-modules/sdk-client/utils/compute-sdk-client-core-checksum-from-archive.util';
import {
  GENERATE_SDK_CLIENT_JOB_NAME,
  type GenerateSdkClientJobData,
} from 'src/engine/core-modules/sdk-client/jobs/generate-sdk-client.job-constants';
import { type SdkClientGenerationTrigger } from 'src/engine/core-modules/sdk-client/types/sdk-client-generation-trigger.type';
import { fromWorkspaceEntityToFlat } from 'src/engine/core-modules/workspace/utils/from-workspace-entity-to-flat.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const SDK_CLIENT_GENERATION_RETRY_LIMIT = 3;

@Injectable()
export class SdkClientGenerationService {
  private readonly logger = new Logger(SdkClientGenerationService.name);

  constructor(
    private readonly fileStorageService: FileStorageService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workspaceGraphqlSchemaSDLService: WorkspaceGraphqlSchemaSDLService,
    private readonly applicationService: ApplicationService,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly metricsService: MetricsService,
    private readonly sdkClientArchiveBuilderFactory: SdkClientArchiveBuilderFactory,
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
        workspaceId,
        applicationUniversalIdentifier,
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

      const schemaSDLResult =
        await this.workspaceGraphqlSchemaSDLService.getOrComputeSchemaSDL(
          fromWorkspaceEntityToFlat(workspaceEntity),
          applicationId,
        );

      const archiveBuffer = await this.generateAndStore({
        workspaceId,
        applicationId,
        applicationUniversalIdentifier,
        schema: isDefined(schemaSDLResult)
          ? printSchema(buildSchema(schemaSDLResult.sdl))
          : '',
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
      this.metricsService.recordHistogram({
        key: MetricsKeys.SdkClientGenerationArchiveSizeBytes,
        value: archiveBuffer.length,
        unit: 'By',
        attributes: { trigger },
        bucketBoundaries: SDK_CLIENT_ARCHIVE_SIZE_BUCKET_BOUNDARIES_BYTES,
      });

      this.logger.log(
        `Generated SDK client for application ${applicationUniversalIdentifier} in workspace ${workspaceId} (trigger: ${trigger}, ${archiveBuffer.length} bytes)`,
      );

      return archiveBuffer;
    } catch (error) {
      this.metricsService.incrementCounterBy({
        key: MetricsKeys.SdkClientGenerationFailed,
        amount: 1,
        attributes: {
          trigger,
          failureCode:
            error instanceof SdkClientException
              ? (error.failureCode ?? error.code)
              : 'UNKNOWN',
        },
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
    try {
      const archiveBuffer = await this.sdkClientArchiveBuilderFactory
        .getCurrentDriver()
        .buildArchive({ schema });

      const sdkClientCoreChecksum =
        await computeSdkClientCoreChecksumFromArchive(archiveBuffer);

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
        {
          failureCode:
            error instanceof SdkClientException ? error.failureCode : undefined,
        },
      );
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
}
