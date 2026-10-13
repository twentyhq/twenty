/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { EVENT_LOG_CLEANUP_CRON_PATTERN } from 'src/engine/core-modules/event-logs/cleanup/constants/event-log-cleanup-cron-pattern.constant';
import {
  EventLogCleanupService,
  type EventLogCleanupWorkspace,
} from 'src/engine/core-modules/event-logs/cleanup/services/event-log-cleanup.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
@Processor(MessageQueue.cronQueue)
export class EventLogCleanupCronJob {
  private readonly logger = new Logger(EventLogCleanupCronJob.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly eventLogCleanupService: EventLogCleanupService,
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

    await this.eventLogCleanupService.cleanupEventLogs(workspaces);
  }

  private async getActiveWorkspaces(): Promise<EventLogCleanupWorkspace[]> {
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
