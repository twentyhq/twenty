import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';
import { ObjectRecordDeleteEvent } from 'src/engine/integrations/event-emitter/types/object-record-delete.event';
import {
  HandleWorkspaceMemberDeletedJob,
  HandleWorkspaceMemberDeletedJobData,
} from 'src/engine/core-modules/workspace/handle-workspace-member-deleted.job';

@Injectable()
export class WorkspaceWorkspaceMemberListener {
  constructor(
    @Inject(MessageQueue.workspaceQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('workspaceMember.deleted')
  async handleDeleteEvent(
    payload: ObjectRecordDeleteEvent<WorkspaceMemberObjectMetadata>,
  ) {
    const userId = payload.details.before.userId;

    if (!userId) {
      return;
    }

    await this.messageQueueService.add<HandleWorkspaceMemberDeletedJobData>(
      HandleWorkspaceMemberDeletedJob.name,
      { workspaceId: payload.workspaceId, userId },
    );
  }
}
