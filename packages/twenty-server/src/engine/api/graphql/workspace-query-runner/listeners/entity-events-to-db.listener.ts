import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { ObjectRecordUpdateEvent } from 'src/engine/integrations/event-emitter/types/object-record-update.event';
import { ObjectRecordDeleteEvent } from 'src/engine/integrations/event-emitter/types/object-record-delete.event';
import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import {
  SaveEventToDbJobData,
  SaveEventToDbJob,
} from 'src/engine/api/graphql/workspace-query-runner/jobs/save-event-to-db.job';

@Injectable()
export class EntityEventsToDbListener {
  constructor(
    @Inject(MessageQueue.entityEventsToDbQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('*.created')
  async handleAllCreate(payload: ObjectRecordCreateEvent<any>) {
    this.messageQueueService.add<SaveEventToDbJobData>(SaveEventToDbJob.name, {
      workspaceId: payload.workspaceId,
      recordId: payload.recordId,
      objectName: payload.objectMetadata.nameSingular,
      operation: payload.operation,
      details: payload.details,
    });
  }

  @OnEvent('*.updated')
  async handleAllUpdate(payload: ObjectRecordUpdateEvent<any>) {
    this.messageQueueService.add<SaveEventToDbJobData>(SaveEventToDbJob.name, {
      workspaceId: payload.workspaceId,
      recordId: payload.recordId,
      objectName: payload.objectMetadata.nameSingular,
      operation: payload.operation,
      details: payload.details,
    });
  }

  @OnEvent('*.deleted')
  async handleAllDelete(payload: ObjectRecordDeleteEvent<any>) {
    this.messageQueueService.add<SaveEventToDbJobData>(SaveEventToDbJob.name, {
      workspaceId: payload.workspaceId,
      recordId: payload.recordId,
      objectName: payload.objectMetadata.nameSingular,
      operation: payload.operation,
      details: payload.details,
    });
  }
}
