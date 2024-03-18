import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import {
  CreatedObjectMetadata,
  ObjectRecordCreateEvent,
} from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import {
  RecordPositionBackfillJob,
  RecordPositionBackfillJobData,
} from 'src/engine/api/graphql/workspace-query-runner/jobs/record-position-backfill.job';

@Injectable()
export class RecordPositionListener {
  constructor(
    @Inject(MessageQueue.recordPositionBackfillQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('*.created')
  async handleAllCreate(payload: ObjectRecordCreateEvent<any>) {
    if (!hasPositionField(payload.createdObjectMetadata)) {
      return;
    }

    if (hasPositionSet(payload.createdRecord)) {
      return;
    }

    this.messageQueueService.add<RecordPositionBackfillJobData>(
      RecordPositionBackfillJob.name,
      {
        workspaceId: payload.workspaceId,
        recordId: payload.createdRecord.id,
        objectMetadata: payload.createdObjectMetadata,
      },
    );
  }
}

const hasPositionField = (
  createdObjectMetadata: CreatedObjectMetadata,
): boolean => {
  return (
    createdObjectMetadata.isCustom ||
    ['opportunity', 'company', 'people'].includes(
      createdObjectMetadata.nameSingular,
    )
  );
};

const hasPositionSet = (createdRecord: any): boolean => {
  return !!createdRecord?.position;
};
