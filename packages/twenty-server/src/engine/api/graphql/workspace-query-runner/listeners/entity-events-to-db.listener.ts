import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { ObjectRecordBaseEvent } from 'src/engine/core-modules/event-emitter/types/object-record.base.event';
import { objectRecordChangedValues } from 'src/engine/core-modules/event-emitter/utils/object-record-changed-values';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/workspace-event.type';
import { CreateAuditLogFromInternalEvent } from 'src/modules/timeline/jobs/create-audit-log-from-internal-event';
import { UpsertTimelineActivityFromInternalEvent } from 'src/modules/timeline/jobs/upsert-timeline-activity-from-internal-event.job';

@Injectable()
export class EntityEventsToDbListener {
  constructor(
    @InjectMessageQueue(MessageQueue.entityEventsToDbQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('*.created')
  async handleCreate(
    payload: WorkspaceEventBatch<ObjectRecordCreateEvent<any>>,
  ) {
    return this.handle(payload);
  }

  @OnEvent('*.updated')
  async handleUpdate(
    payload: WorkspaceEventBatch<ObjectRecordUpdateEvent<any>>,
  ) {
    for (const eventPayload of payload.events) {
      eventPayload.properties.diff = objectRecordChangedValues(
        eventPayload.properties.before,
        eventPayload.properties.after,
        eventPayload.properties.updatedFields,
        eventPayload.objectMetadata,
      );
    }

    return this.handle(payload);
  }

  @OnEvent('*.deleted')
  async handleDelete(
    payload: WorkspaceEventBatch<ObjectRecordUpdateEvent<any>>,
  ) {
    return this.handle(payload);
  }

  @OnEvent('*.destroyed')
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
  }
}
