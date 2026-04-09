import { Injectable } from '@nestjs/common';

import { type ObjectRecordDestroyEvent } from 'twenty-shared/database-events';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import {
  FileDeletionJob,
  type FileDeletionJobData,
} from 'src/engine/core-modules/file/jobs/file-deletion.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { type AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';

@Injectable()
export class FileAttachmentListener {
  constructor(
    @InjectMessageQueue(MessageQueue.deleteCascadeQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnDatabaseBatchEvent('attachment', DatabaseEventAction.DESTROYED)
  async handleDestroyEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordDestroyEvent<AttachmentWorkspaceEntity>
    >,
  ) {
    for (const event of payload.events) {
      await this.messageQueueService.add<FileDeletionJobData>(
        FileDeletionJob.name,
        {
          workspaceId: payload.workspaceId,
          fullPath: event.properties.before.fullPath ?? '',
        },
      );
    }
  }
}
