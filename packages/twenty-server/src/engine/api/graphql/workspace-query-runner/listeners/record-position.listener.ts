import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
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
    if (!hasPositionField(payload.objectMetadata)) {
      return;
    }

    if (hasPositionSet(payload.details.after)) {
      return;
    }

    this.messageQueueService.add<RecordPositionBackfillJobData>(
      RecordPositionBackfillJob.name,
      {
        workspaceId: payload.workspaceId,
        recordId: payload.recordId,
        objectMetadata: {
          nameSingular: payload.objectMetadata.nameSingular,
          isCustom: payload.objectMetadata.isCustom,
        },
      },
    );
  }
}

// TODO: use objectMetadata instead of hardcoded standard objects name
const hasPositionField = (
  createdObjectMetadata: ObjectMetadataInterface,
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
