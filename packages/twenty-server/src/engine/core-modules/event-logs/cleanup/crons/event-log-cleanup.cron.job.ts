/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { EVENT_LOG_CLEANUP_CRON_PATTERN } from 'src/engine/core-modules/event-logs/cleanup/constants/event-log-cleanup-cron-pattern.constant';
import {
  EventLogCleanupJob,
  type EventLogCleanupJobData,
} from 'src/engine/core-modules/event-logs/cleanup/jobs/event-log-cleanup.job';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
@Processor(MessageQueue.cronQueue)
export class EventLogCleanupCronJob {
  private readonly logger = new Logger(EventLogCleanupCronJob.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(EventLogCleanupCronJob.name)
  @SentryCronMonitor(
    EventLogCleanupCronJob.name,
    EVENT_LOG_CLEANUP_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const workspaces = await this.getActiveWorkspaces();

    if (workspaces.length === 0) {
      this.logger.log('No active workspaces found for event log cleanup');

      return;
    }

    this.logger.log(
      `Enqueuing event log cleanup jobs for ${workspaces.length} workspace(s)`,
    );

    for (const workspace of workspaces) {
      try {
        await this.messageQueueService.add<EventLogCleanupJobData>(
          EventLogCleanupJob.name,
          {
            workspaceId: workspace.id,
            eventLogRetentionDays: workspace.eventLogRetentionDays,
          },
        );
      } catch (error) {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: {
            id: workspace.id,
          },
        });
      }
    }

    this.logger.log(
      `Successfully enqueued ${workspaces.length} event log cleanup job(s)`,
    );
  }

  private async getActiveWorkspaces(): Promise<
    Array<{ id: string; eventLogRetentionDays: number }>
  > {
    const workspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
      select: ['id', 'eventLogRetentionDays'],
      order: { id: 'ASC' },
    });

    if (workspaces.length === 0) {
      return [];
    }

    return workspaces.map((workspace) => ({
      id: workspace.id,
      eventLogRetentionDays: workspace.eventLogRetentionDays,
    }));
  }
}
