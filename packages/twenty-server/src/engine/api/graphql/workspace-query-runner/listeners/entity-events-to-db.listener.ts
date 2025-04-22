import { Injectable } from '@nestjs/common';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { ObjectRecordDestroyEvent } from 'src/engine/core-modules/event-emitter/types/object-record-destroy.event';
import { ObjectRecordEvent } from 'src/engine/core-modules/event-emitter/types/object-record-event.event';
import { ObjectRecordNonDestructiveEvent } from 'src/engine/core-modules/event-emitter/types/object-record-non-destructive-event';
import { ObjectRecordRestoreEvent } from 'src/engine/core-modules/event-emitter/types/object-record-restore.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { CreateAuditLogFromInternalEvent } from 'src/modules/timeline/jobs/create-audit-log-from-internal-event';
import { UpsertTimelineActivityFromInternalEvent } from 'src/modules/timeline/jobs/upsert-timeline-activity-from-internal-event.job';
import { CallWebhookJobsJob } from 'src/modules/webhook/jobs/call-webhook-jobs.job';
import { SubscriptionsJob } from 'src/engine/subscriptions/subscriptions.job';

@Injectable()
export class EntityEventsToDbListener {
  constructor(
    @InjectMessageQueue(MessageQueue.entityEventsToDbQueue)
    private readonly entityEventsToDbQueueService: MessageQueueService,
    @InjectMessageQueue(MessageQueue.webhookQueue)
    private readonly webhookQueueService: MessageQueueService,
    @InjectMessageQueue(MessageQueue.subscriptionsQueue)
    private readonly subscriptionsQueueService: MessageQueueService,
  ) {}

  @OnDatabaseBatchEvent('*', DatabaseEventAction.CREATED)
  async handleCreate(batchEvent: WorkspaceEventBatch<ObjectRecordCreateEvent>) {
    return this.handleEvent(batchEvent, DatabaseEventAction.CREATED);
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.UPDATED)
  async handleUpdate(batchEvent: WorkspaceEventBatch<ObjectRecordUpdateEvent>) {
    return this.handleEvent(batchEvent, DatabaseEventAction.UPDATED);
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.DELETED)
  async handleDelete(batchEvent: WorkspaceEventBatch<ObjectRecordDeleteEvent>) {
    return this.handleEvent(batchEvent, DatabaseEventAction.DELETED);
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.RESTORED)
  async handleRestore(
    batchEvent: WorkspaceEventBatch<ObjectRecordRestoreEvent>,
  ) {
    return this.handleEvent(batchEvent, DatabaseEventAction.RESTORED);
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.DESTROYED)
  async handleDestroy(
    batchEvent: WorkspaceEventBatch<ObjectRecordDestroyEvent>,
  ) {
    return this.handleEvent(batchEvent, DatabaseEventAction.DESTROYED);
  }

  private async handleEvent<T extends ObjectRecordEvent>(
    batchEvent: WorkspaceEventBatch<T>,
    action: DatabaseEventAction,
  ) {
    const filteredEvents = batchEvent.events.filter(
      (event) => event.objectMetadata?.isAuditLogged,
    );

    await Promise.all([
      this.subscriptionsQueueService.add<WorkspaceEventBatch<T>>(
        SubscriptionsJob.name,
        batchEvent,
        { retryLimit: 3 },
      ),
      this.webhookQueueService.add<WorkspaceEventBatch<T>>(
        CallWebhookJobsJob.name,
        batchEvent,
        {
          retryLimit: 3,
        },
      ),
      this.entityEventsToDbQueueService.add<WorkspaceEventBatch<T>>(
        CreateAuditLogFromInternalEvent.name,
        {
          ...batchEvent,
          events: filteredEvents,
        },
      ),
      ...(action !== DatabaseEventAction.DESTROYED
        ? [
            this.entityEventsToDbQueueService.add<
              WorkspaceEventBatch<ObjectRecordNonDestructiveEvent>
            >(UpsertTimelineActivityFromInternalEvent.name, {
              ...batchEvent,
              events: filteredEvents,
            }),
          ]
        : []),
    ]);
  }
}
