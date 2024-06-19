import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import { objectRecordChangedValues } from 'src/engine/integrations/event-emitter/utils/object-record-changed-values';
import { ObjectRecordUpdateEvent } from 'src/engine/integrations/event-emitter/types/object-record-update.event';
import { ObjectRecordBaseEvent } from 'src/engine/integrations/event-emitter/types/object-record.base.event';
import { UpsertTimelineActivityFromInternalEvent } from 'src/modules/timeline/jobs/upsert-timeline-activity-from-internal-event.job';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { CreateAuditLogFromInternalEvent } from 'src/modules/timeline/jobs/create-audit-log-from-internal-event';

@Injectable()
export class EntityEventsToDbListener {
  constructor(
    @InjectMessageQueue(MessageQueue.entityEventsToDbQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('*.created')
  async handleCreate(payload: ObjectRecordCreateEvent<any>) {
    return this.handle(payload);
  }

  @OnEvent('*.updated')
  async handleUpdate(payload: ObjectRecordUpdateEvent<any>) {
    payload.properties.diff = objectRecordChangedValues(
      payload.properties.before,
      payload.properties.after,
      payload.objectMetadata,
    );

    return this.handle(payload);
  }

  // @OnEvent('*.deleted') - TODO: implement when we soft delete has been implemented
  // ....

  // @OnEvent('*.restored') - TODO: implement when we soft delete has been implemented
  // ....

  private async handle(payload: ObjectRecordBaseEvent) {
    if (!payload.objectMetadata.isAuditLogged) {
      return;
    }

    this.messageQueueService.add<ObjectRecordBaseEvent>(
      CreateAuditLogFromInternalEvent.name,
      payload,
    );

    this.messageQueueService.add<ObjectRecordBaseEvent>(
      UpsertTimelineActivityFromInternalEvent.name,
      payload,
    );
  }
}
