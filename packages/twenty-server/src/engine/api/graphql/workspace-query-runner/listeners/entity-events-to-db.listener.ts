import { Injectable } from '@nestjs/common';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { CreateAuditLogFromInternalEvent } from 'src/engine/core-modules/audit/jobs/create-audit-log-from-internal-event';
import { type ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { type ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { type ObjectRecordDestroyEvent } from 'src/engine/core-modules/event-emitter/types/object-record-destroy.event';
import { type ObjectRecordEvent } from 'src/engine/core-modules/event-emitter/types/object-record-event.event';
import { type ObjectRecordNonDestructiveEvent } from 'src/engine/core-modules/event-emitter/types/object-record-non-destructive-event';
import { type ObjectRecordRestoreEvent } from 'src/engine/core-modules/event-emitter/types/object-record-restore.event';
import { type ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { CallWebhookJobsJob } from 'src/engine/core-modules/webhook/jobs/call-webhook-jobs.job';
import { type ObjectRecordEventForWebhook } from 'src/engine/core-modules/webhook/types/object-record-event-for-webhook.type';
import { CallDatabaseEventTriggerJobsJob } from 'src/engine/metadata-modules/database-event-trigger/jobs/call-database-event-trigger-jobs.job';
import { SubscriptionsService } from 'src/engine/subscriptions/subscriptions.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { UpsertTimelineActivityFromInternalEvent } from 'src/modules/timeline/jobs/upsert-timeline-activity-from-internal-event.job';

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
    private readonly featureFlagService: FeatureFlagService,
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
    const auditLogsEvents = batchEvent.events.filter(
      (event) => event.objectMetadata?.isAuditLogged,
    );

    const batchEventEventsForWebhook: ObjectRecordEventForWebhook[] =
      batchEvent.events.map((event) => ({
        ...event,
        objectMetadata: {
          id: event.objectMetadata.id,
          nameSingular: event.objectMetadata.nameSingular,
        },
      }));

    const isDatabaseEventTriggerEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_DATABASE_EVENT_TRIGGER_ENABLED,
        batchEvent.workspaceId,
      );

    const promises = [
      this.subscriptionsService.publish(batchEvent),
      this.webhookQueueService.add<
        WorkspaceEventBatch<ObjectRecordEventForWebhook>
      >(
        CallWebhookJobsJob.name,
        { ...batchEvent, events: batchEventEventsForWebhook },
        {
          retryLimit: 3,
        },
      ),
    ];

    if (isDatabaseEventTriggerEnabled) {
      promises.push(
        this.triggerQueueService.add<WorkspaceEventBatch<T>>(
          CallDatabaseEventTriggerJobsJob.name,
          batchEvent,
          { retryLimit: 3 },
        ),
      );
    }

    if (auditLogsEvents.length > 0) {
      promises.push(
        this.entityEventsToDbQueueService.add<WorkspaceEventBatch<T>>(
          CreateAuditLogFromInternalEvent.name,
          {
            ...batchEvent,
            events: auditLogsEvents,
          },
        ),
      );

      if (action !== DatabaseEventAction.DESTROYED) {
        promises.push(
          this.entityEventsToDbQueueService.add<
            WorkspaceEventBatch<ObjectRecordNonDestructiveEvent>
          >(UpsertTimelineActivityFromInternalEvent.name, {
            ...batchEvent,
            events: auditLogsEvents,
          }),
        );
      }
    }

    await Promise.all(promises);
  }
}
