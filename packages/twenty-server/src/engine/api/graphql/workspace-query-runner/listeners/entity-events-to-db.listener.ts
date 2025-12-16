import { Injectable } from '@nestjs/common';

import {
  type ObjectRecordCreateEvent,
  type ObjectRecordDeleteEvent,
  type ObjectRecordDestroyEvent,
  type ObjectRecordRestoreEvent,
  type ObjectRecordUpdateEvent,
  type ObjectRecordEvent,
  type ObjectRecordNonDestructiveEvent,
} from 'twenty-shared/database-events';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { CreateAuditLogFromInternalEvent } from 'src/engine/core-modules/audit/jobs/create-audit-log-from-internal-event';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { CallWebhookJobsJob } from 'src/engine/core-modules/webhook/jobs/call-webhook-jobs.job';
import { CallDatabaseEventTriggerJobsJob } from 'src/engine/metadata-modules/database-event-trigger/jobs/call-database-event-trigger-jobs.job';
import { SubscriptionsService } from 'src/engine/subscriptions/subscriptions.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { UpsertTimelineActivityFromInternalEvent } from 'src/modules/timeline/jobs/upsert-timeline-activity-from-internal-event.job';
import { WorkspaceEventBatchForWebhook } from 'src/engine/core-modules/webhook/types/workspace-event-batch-for-webhook.type';

@Injectable()
export class EntityEventsToDbListener {
  constructor(
    @InjectMessageQueue(MessageQueue.entityEventsToDbQueue)
    private readonly entityEventsToDbQueueService: MessageQueueService,
    @InjectMessageQueue(MessageQueue.webhookQueue)
    private readonly webhookQueueService: MessageQueueService,
    @InjectMessageQueue(MessageQueue.triggerQueue)
    private readonly triggerQueueService: MessageQueueService,
    private readonly subscriptionsService: SubscriptionsService,
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
    const isAuditLogBatchEvent = batchEvent.objectMetadata?.isAuditLogged;

    const batchEventForWebhook = {
      ...batchEvent,
      objectMetadata: {
        id: batchEvent.objectMetadata.id,
        nameSingular: batchEvent.objectMetadata.nameSingular,
      },
    };

    const promises = [
      this.subscriptionsService.publish(batchEvent),
      this.webhookQueueService.add<WorkspaceEventBatchForWebhook<T>>(
        CallWebhookJobsJob.name,
        batchEventForWebhook,
        {
          retryLimit: 3,
        },
      ),
    ];

    promises.push(
      this.triggerQueueService.add<WorkspaceEventBatch<T>>(
        CallDatabaseEventTriggerJobsJob.name,
        batchEvent,
        { retryLimit: 3 },
      ),
    );

    if (isAuditLogBatchEvent) {
      promises.push(
        this.entityEventsToDbQueueService.add<WorkspaceEventBatch<T>>(
          CreateAuditLogFromInternalEvent.name,
          batchEvent,
        ),
      );

      if (action !== DatabaseEventAction.DESTROYED) {
        promises.push(
          this.entityEventsToDbQueueService.add<
            WorkspaceEventBatch<ObjectRecordNonDestructiveEvent>
          >(UpsertTimelineActivityFromInternalEvent.name, batchEvent),
        );
      }
    }

    await Promise.all(promises);
  }
}
