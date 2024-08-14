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
    payload: ObjectRecordUpdateEvent<WorkspaceMemberWorkspaceEntity>[],
  ) {
    await Promise.all(
      payload.map((eventPayload) => {
        const { firstName: firstNameAfter, lastName: lastNameAfter } =
          eventPayload.properties.after.name;

        if (firstNameAfter === '' && lastNameAfter === '') {
          return;
        }

        if (!eventPayload.userId) {
          return;
        }

        return this.onboardingService.setOnboardingCreateProfilePending({
          userId: eventPayload.userId,
          workspaceId: eventPayload.workspaceId,
          value: false,
        });
      }),
    );
  }

  @OnEvent('workspaceMember.deleted')
  async handleDeleteEvent(
    payload: ObjectRecordDeleteEvent<WorkspaceMemberWorkspaceEntity>[],
  ) {
    await Promise.all(
      payload.map((eventPayload) => {
        const userId = eventPayload.properties.before.userId;

        if (!userId) {
          return;
        }

        return this.messageQueueService.add<HandleWorkspaceMemberDeletedJobData>(
          HandleWorkspaceMemberDeletedJob.name,
          { workspaceId: eventPayload.workspaceId, userId },
        );
      }),
    );
  }
}
