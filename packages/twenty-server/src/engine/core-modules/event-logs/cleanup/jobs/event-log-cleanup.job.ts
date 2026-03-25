/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { EventLogCleanupService } from 'src/engine/core-modules/event-logs/cleanup/services/event-log-cleanup.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type EventLogCleanupJobData = {
  workspaceId: string;
  eventLogRetentionDays: number;
};

@Injectable()
@Processor(MessageQueue.workspaceQueue)
export class EventLogCleanupJob {
  private readonly logger = new Logger(EventLogCleanupJob.name);

  constructor(
    private readonly eventLogCleanupService: EventLogCleanupService,
  ) {}

  @Process(EventLogCleanupJob.name)
  async handle(data: EventLogCleanupJobData): Promise<void> {
    const { workspaceId, eventLogRetentionDays } = data;

    try {
      await this.eventLogCleanupService.cleanupWorkspaceEventLogs({
        workspaceId,
        retentionDays: eventLogRetentionDays,
      });
    } catch (error) {
      this.logger.error(
        `Event log cleanup failed for workspace ${workspaceId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
