import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
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

  @OnEvent('*.*')
  async handle(payload: ObjectRecordCreateEvent<any>) {
    this.messageQueueService.add<SaveEventToDbJobData>(SaveEventToDbJob.name, {
      workspaceId: payload.workspaceId,
      recordId: payload.recordId,
      objectName: payload.objectMetadata.nameSingular,
      operation: payload.operation,
      details: payload.details,
    });
  }
}
