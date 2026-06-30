import { Injectable, Logger } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { PendingMetadataDropService } from 'src/engine/core-modules/metadata-removal-retention/pending-metadata-drop.service';

export type MetadataRemovalRetentionJobData = {
  workspaceId: string;
};

@Injectable()
@Processor(MessageQueue.workspaceQueue)
export class MetadataRemovalRetentionJob {
  private readonly logger = new Logger(MetadataRemovalRetentionJob.name);

  constructor(
    private readonly pendingMetadataDropService: PendingMetadataDropService,
  ) {}

  @Process(MetadataRemovalRetentionJob.name)
  async handle(data: MetadataRemovalRetentionJobData): Promise<void> {
    try {
      await this.pendingMetadataDropService.dropDueForWorkspace({
        workspaceId: data.workspaceId,
        now: new Date(),
      });
    } catch (error) {
      this.logger.error(
        `Metadata removal retention failed for workspace ${data.workspaceId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
