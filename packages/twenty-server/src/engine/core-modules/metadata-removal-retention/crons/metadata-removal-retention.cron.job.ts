import { Injectable, Logger } from '@nestjs/common';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { METADATA_REMOVAL_RETENTION_CRON_PATTERN } from 'src/engine/core-modules/metadata-removal-retention/constants/metadata-removal-retention-cron-pattern.constant';
import {
  MetadataRemovalRetentionJob,
  type MetadataRemovalRetentionJobData,
} from 'src/engine/core-modules/metadata-removal-retention/jobs/metadata-removal-retention.job';
import { PendingMetadataDropService } from 'src/engine/core-modules/metadata-removal-retention/pending-metadata-drop.service';

@Injectable()
@Processor(MessageQueue.cronQueue)
export class MetadataRemovalRetentionCronJob {
  private readonly logger = new Logger(MetadataRemovalRetentionCronJob.name);

  constructor(
    private readonly pendingMetadataDropService: PendingMetadataDropService,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(MetadataRemovalRetentionCronJob.name)
  @SentryCronMonitor(
    MetadataRemovalRetentionCronJob.name,
    METADATA_REMOVAL_RETENTION_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const workspaceIds =
      await this.pendingMetadataDropService.findWorkspaceIdsWithDueDrops(
        new Date(),
      );

    if (workspaceIds.length === 0) {
      return;
    }

    this.logger.log(
      `Enqueuing metadata removal retention jobs for ${workspaceIds.length} workspace(s)`,
    );

    for (const workspaceId of workspaceIds) {
      try {
        await this.messageQueueService.add<MetadataRemovalRetentionJobData>(
          MetadataRemovalRetentionJob.name,
          { workspaceId },
        );
      } catch (error) {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: { id: workspaceId },
        });
      }
    }
  }
}
