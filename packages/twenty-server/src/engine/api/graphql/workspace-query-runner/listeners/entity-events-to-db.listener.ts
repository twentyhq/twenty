import { Injectable } from '@nestjs/common';

import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { ObjectRecordBaseEvent } from 'src/engine/core-modules/event-emitter/types/object-record.base.event';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { CreateAuditLogFromInternalEvent } from 'src/modules/timeline/jobs/create-audit-log-from-internal-event';
import { UpsertTimelineActivityFromInternalEvent } from 'src/modules/timeline/jobs/upsert-timeline-activity-from-internal-event.job';
import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { CallWebhookJobsJob } from 'src/modules/webhook/jobs/call-webhook-jobs.job';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

@Injectable()
export class EntityEventsToDbListener {
  constructor(
    @InjectMessageQueue(MessageQueue.entityEventsToDbQueue)
    private readonly entityEventsToDbQueueService: MessageQueueService,
    @InjectMessageQueue(MessageQueue.webhookQueue)
    private readonly webhookQueueService: MessageQueueService,
  ) {}

  @OnDatabaseBatchEvent('*', DatabaseEventAction.CREATED)
  async handleCreate(batchEvent: WorkspaceEventBatch<ObjectRecordCreateEvent>) {
    return this.handle(batchEvent);
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.UPDATED)
  async handleUpdate(batchEvent: WorkspaceEventBatch<ObjectRecordUpdateEvent>) {
    return this.handle(batchEvent);
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.DELETED)
  async handleDelete(batchEvent: WorkspaceEventBatch<ObjectRecordUpdateEvent>) {
    return this.handle(batchEvent);
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.DESTROYED)
  async handleDestroy(
    batchEvent: WorkspaceEventBatch<ObjectRecordUpdateEvent>,
  ) {
    return this.handle(batchEvent);
  }

  private async handle(batchEvent: WorkspaceEventBatch<ObjectRecordBaseEvent>) {
    const filteredEvents = batchEvent.events.filter(
      (event) => event.objectMetadata?.isAuditLogged,
    );

    await this.entityEventsToDbQueueService.add<
      WorkspaceEventBatch<ObjectRecordBaseEvent>
    >(CreateAuditLogFromInternalEvent.name, {
      ...batchEvent,
      events: filteredEvents,
    });

    await this.entityEventsToDbQueueService.add<
      WorkspaceEventBatch<ObjectRecordBaseEvent>
    >(UpsertTimelineActivityFromInternalEvent.name, {
      ...batchEvent,
      events: filteredEvents,
    });

    await this.webhookQueueService.add<
      WorkspaceEventBatch<ObjectRecordBaseEvent>
    >(CallWebhookJobsJob.name, batchEvent, { retryLimit: 3 });
  }
}
