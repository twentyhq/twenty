import { Injectable } from '@nestjs/common';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordDestroyEvent } from 'src/engine/core-modules/event-emitter/types/object-record-destroy.event';
import {
  FileDeletionJob,
  FileDeletionJobData,
} from 'src/engine/core-modules/file/jobs/file-deletion.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class FileWorkspaceMemberListener {
  constructor(
    @InjectMessageQueue(MessageQueue.deleteCascadeQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.DESTROYED)
  async handleDestroyEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordDestroyEvent<WorkspaceMemberWorkspaceEntity>
    >,
  ) {
    for (const event of payload.events) {
      const avatarUrl = event.properties.before.avatarUrl;

      if (!avatarUrl) {
        continue;
      }

      this.messageQueueService.add<FileDeletionJobData>(FileDeletionJob.name, {
        workspaceId: payload.workspaceId,
        fullPath: event.properties.before.avatarUrl,
      });
    }
  }
}
