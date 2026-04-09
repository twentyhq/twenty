import { Injectable } from '@nestjs/common';

import { type ObjectRecordDeleteEvent } from 'twenty-shared/database-events';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { type CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import {
  CalendarChannelDeletionCleanupJob,
  type CalendarChannelDeletionCleanupJobData,
} from 'src/modules/calendar/calendar-event-cleaner/jobs/calendar-channel-deletion-cleanup.job';
import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

@Injectable()
export class CalendarEventCleanerCalendarChannelListener {
  constructor(
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly calendarQueueService: MessageQueueService,
  ) {}

  @OnDatabaseBatchEvent('calendarChannel', DatabaseEventAction.DESTROYED)
  async handleDestroyedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<CalendarChannelWorkspaceEntity>
    >,
  ) {
    await Promise.all(
      payload.events.map((eventPayload) =>
        this.calendarQueueService.add<CalendarChannelDeletionCleanupJobData>(
          CalendarChannelDeletionCleanupJob.name,
          {
            workspaceId: payload.workspaceId,
            calendarChannelId: eventPayload.recordId,
          },
        ),
      ),
    );
  }
}
