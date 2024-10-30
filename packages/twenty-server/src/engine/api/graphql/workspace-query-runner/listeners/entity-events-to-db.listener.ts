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
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/services/api-event-emitter.service';
import { OnDatabaseEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-event.decorator';
import { CallWebhookJobsJob } from 'src/modules/webhook/jobs/call-webhook-jobs.job';

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

    await this.messageQueueService.add<
      WorkspaceEventBatch<ObjectRecordBaseEvent>
    >(CallWebhookJobsJob.name, payload, { retryLimit: 3 });
  }
}
