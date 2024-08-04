import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import {
  HandleWorkspaceMemberDeletedJob,
  HandleWorkspaceMemberDeletedJobData,
} from 'src/engine/core-modules/workspace/handle-workspace-member-deleted.job';
import { ObjectRecordDeleteEvent } from 'src/engine/integrations/event-emitter/types/object-record-delete.event';
import { ObjectRecordUpdateEvent } from 'src/engine/integrations/event-emitter/types/object-record-update.event';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class WorkspaceWorkspaceMemberListener {
  constructor(
    private readonly onboardingService: OnboardingService,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('workspaceMember.updated')
  async handleUpdateEvent(
    payload: ObjectRecordUpdateEvent<WorkspaceMemberWorkspaceEntity>,
  ) {
    const { firstName: firstNameAfter, lastName: lastNameAfter } =
      payload.properties.after.name;

    if (firstNameAfter === '' && lastNameAfter === '') {
      return;
    }

    if (!payload.userId) {
      return;
    }

    await this.onboardingService.setOnboardingCreateProfilePending({
      userId: payload.userId,
      workspaceId: payload.workspaceId,
      value: false,
    });
  }

  @OnEvent('workspaceMember.deleted')
  async handleDeleteEvent(
    payload: ObjectRecordDeleteEvent<WorkspaceMemberWorkspaceEntity>,
  ) {
    const userId = payload.properties.before.userId;

    if (!userId) {
      return;
    }

    await this.messageQueueService.add<HandleWorkspaceMemberDeletedJobData>(
      HandleWorkspaceMemberDeletedJob.name,
      { workspaceId: payload.workspaceId, userId },
    );
  }
}
