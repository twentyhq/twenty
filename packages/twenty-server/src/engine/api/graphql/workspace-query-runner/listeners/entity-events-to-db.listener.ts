import { Injectable } from '@nestjs/common';

import {
  type ObjectRecordCreateEvent,
  type ObjectRecordDeleteEvent,
  type ObjectRecordDestroyEvent,
  type ObjectRecordEvent,
  type ObjectRecordNonDestructiveEvent,
  type ObjectRecordRestoreEvent,
  type ObjectRecordUpdateEvent,
} from 'twenty-shared/database-events';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { CreateEventLogFromInternalEvent } from 'src/engine/core-modules/event-logs/ingest/create-event-log-from-internal-event';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { CallWebhookJobsJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook-jobs.job';
import { WorkspaceEventBatchForWebhook } from 'src/engine/metadata-modules/webhook/types/workspace-event-batch-for-webhook.type';
import { filterWebhooksMatchingEvent } from 'src/engine/metadata-modules/webhook/utils/filter-webhooks-matching-event.util';
import { CallDatabaseEventTriggerJobsJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/call-database-event-trigger-jobs.job';
import { filterLogicFunctionsWithMatchingDatabaseEventTrigger } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/utils/filter-logic-functions-with-matching-database-event-trigger.util';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { ObjectRecordEventPublisher } from 'src/engine/subscriptions/object-record-event/object-record-event-publisher';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { UpsertTimelineActivityFromInternalEvent } from 'src/modules/timeline/jobs/upsert-timeline-activity-from-internal-event.job';
import { TimelineActivityRoutingPlanService } from 'src/modules/timeline/services/timeline-activity-routing-plan.service';

@Injectable()
export class EntityEventsToDbListener {
  constructor(
    @InjectMessageQueue(MessageQueue.entityEventsToDbQueue)
    private readonly entityEventsToDbQueueService: MessageQueueService,
    @InjectMessageQueue(MessageQueue.webhookQueue)
    private readonly webhookQueueService: MessageQueueService,
    @InjectMessageQueue(MessageQueue.triggerQueue)
    private readonly triggerQueueService: MessageQueueService,
    private readonly objectRecordEventPublisher: ObjectRecordEventPublisher,
    private readonly timelineActivityRoutingPlanService: TimelineActivityRoutingPlanService,
    private readonly workspaceCacheService: WorkspaceCacheService,
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
    if (
      batchEvent.objectMetadata.universalIdentifier ===
      STANDARD_OBJECTS.timelineActivity.universalIdentifier
    ) {
      await this.objectRecordEventPublisher.publish(batchEvent);

      return;
    }

    const isAuditLogBatchEvent = batchEvent.objectMetadata?.isAuditLogged;
    const shouldCreateTimelineActivity =
      action !== DatabaseEventAction.DESTROYED &&
      (await this.timelineActivityRoutingPlanService.shouldProcessEvent({
        flatObjectMetadata: batchEvent.objectMetadata,
        workspaceId: batchEvent.workspaceId,
      }));

    const batchEventForWebhook = {
      ...batchEvent,
      objectMetadata: {
        id: batchEvent.objectMetadata.id,
        nameSingular: batchEvent.objectMetadata.nameSingular,
      },
    };

    const [nameSingular, operation] = batchEvent.name.split('.');

    const { flatWebhookMaps, flatLogicFunctionMaps } =
      await this.workspaceCacheService.getOrRecompute(batchEvent.workspaceId, [
        'flatWebhookMaps',
        'flatLogicFunctionMaps',
      ]);

    const promises: Promise<unknown>[] = [
      this.objectRecordEventPublisher.publish(batchEvent),
    ];

    // A batch carries every mutated record, so enqueueing it when nothing
    // subscribes strands multi-MB payloads in Redis for the whole retention
    // window while the consumer would have dropped them on dequeue
    const hasWebhookToCall =
      filterWebhooksMatchingEvent({
        flatWebhookMaps,
        nameSingular,
        operation,
      }).length > 0;

    if (hasWebhookToCall) {
      promises.push(
        this.webhookQueueService.add<WorkspaceEventBatchForWebhook<T>>(
          CallWebhookJobsJob.name,
          batchEventForWebhook,
          {
            retryLimit: 3,
          },
        ),
      );
    }

    const hasDatabaseEventTriggerToCall =
      filterLogicFunctionsWithMatchingDatabaseEventTrigger({
        flatLogicFunctionMaps,
        batchEventName: batchEvent.name,
      }).length > 0;

    if (hasDatabaseEventTriggerToCall) {
      promises.push(
        this.triggerQueueService.add<WorkspaceEventBatch<T>>(
          CallDatabaseEventTriggerJobsJob.name,
          batchEvent,
          { retryLimit: 3 },
        ),
      );
    }

    if (shouldCreateTimelineActivity) {
      promises.push(
        this.entityEventsToDbQueueService.add<
          WorkspaceEventBatch<ObjectRecordNonDestructiveEvent>
        >(
          UpsertTimelineActivityFromInternalEvent.name,
          batchEvent as WorkspaceEventBatch<ObjectRecordNonDestructiveEvent>,
          { retryLimit: 1 },
        ),
      );
    }

    if (isAuditLogBatchEvent && action !== DatabaseEventAction.DESTROYED) {
      promises.push(
        this.entityEventsToDbQueueService.add<WorkspaceEventBatch<T>>(
          CreateEventLogFromInternalEvent.name,
          batchEvent,
          { retryLimit: 1 },
        ),
      );
    }

    await Promise.all(promises);
  }
}
