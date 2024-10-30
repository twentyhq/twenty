import { Injectable } from '@nestjs/common';

import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { ObjectRecordBaseEvent } from 'src/engine/core-modules/event-emitter/types/object-record.base.event';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/workspace-event.type';
import { CreateAuditLogFromInternalEvent } from 'src/modules/timeline/jobs/create-audit-log-from-internal-event';
import { UpsertTimelineActivityFromInternalEvent } from 'src/modules/timeline/jobs/upsert-timeline-activity-from-internal-event.job';
import {
  CallWebhookJobsJob,
  CallWebhookJobsJobData,
} from 'src/engine/api/graphql/workspace-query-runner/jobs/call-webhook-jobs.job';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/services/api-event-emitter.service';
import { OnDatabaseEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-event.decorator';

@Injectable()
export class EntityEventsToDbListener {
  constructor(
    @InjectMessageQueue(MessageQueue.entityEventsToDbQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnDatabaseEvent('*', DatabaseEventAction.CREATED)
  async handleCreate(
    payload: WorkspaceEventBatch<ObjectRecordCreateEvent<any>>,
  ) {
    return this.handle(payload);
  }

  @OnDatabaseEvent('*', DatabaseEventAction.UPDATED)
  async handleUpdate(
    payload: WorkspaceEventBatch<ObjectRecordUpdateEvent<any>>,
  ) {
    return this.handle(payload);
  }

  @OnDatabaseEvent('*', DatabaseEventAction.DELETED)
  async handleDelete(
    payload: WorkspaceEventBatch<ObjectRecordUpdateEvent<any>>,
  ) {
    return this.handle(payload);
  }

  @OnDatabaseEvent('*', DatabaseEventAction.DESTROYED)
  async handleDestroy(
    payload: WorkspaceEventBatch<ObjectRecordUpdateEvent<any>>,
  ) {
    return this.handle(payload);
  }

  private async handle(payload: WorkspaceEventBatch<ObjectRecordBaseEvent>) {
    const filteredEvents = payload.events.filter(
      (event) => event.objectMetadata?.isAuditLogged,
    );

    await this.messageQueueService.add<
      WorkspaceEventBatch<ObjectRecordBaseEvent>
    >(CreateAuditLogFromInternalEvent.name, {
      ...payload,
      events: filteredEvents,
    });

    await this.messageQueueService.add<
      WorkspaceEventBatch<ObjectRecordBaseEvent>
    >(UpsertTimelineActivityFromInternalEvent.name, {
      ...payload,
      events: filteredEvents,
    });

    payload.events.forEach((event) => {
      this.messageQueueService.add<CallWebhookJobsJobData>(
        CallWebhookJobsJob.name,
        {
          record: event,
          workspaceId: payload.workspaceId,
          eventName: payload.name,
          objectMetadataItem: event.objectMetadata,
        },
        { retryLimit: 3 },
      );
    });
  }
}
