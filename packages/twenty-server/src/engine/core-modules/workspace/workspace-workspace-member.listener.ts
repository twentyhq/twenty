import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { ObjectRecordDeleteEvent } from 'src/engine/integrations/event-emitter/types/object-record-delete.event';
import {
  HandleWorkspaceMemberDeletedJob,
  HandleWorkspaceMemberDeletedJobData,
} from 'src/engine/core-modules/workspace/handle-workspace-member-deleted.job';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { ObjectRecordUpdateEvent } from 'src/engine/integrations/event-emitter/types/object-record-update.event';
import {
  OnboardingKeyValueTypeMap,
  OnboardingStepBooleanValues,
  OnboardingStepKeys,
} from 'src/engine/core-modules/onboarding/onboarding.service';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';

@Injectable()
export class WorkspaceWorkspaceMemberListener {
  constructor(
    private readonly userVarsService: UserVarsService<OnboardingKeyValueTypeMap>,
    private readonly userWorkspaceService: UserWorkspaceService,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('workspaceMember.created')
  async handleCreateEvent(
    payload: ObjectRecordCreateEvent<WorkspaceMemberWorkspaceEntity>,
  ) {
    const setDisplayInviteTeamOnboardingStepValue =
      await this.userVarsService.get({
        workspaceId: payload.workspaceId,
        key: OnboardingStepKeys.DISPLAY_INVITE_TEAM_ONBOARDING_STEP,
      });

    if (
      setDisplayInviteTeamOnboardingStepValue ===
      OnboardingStepBooleanValues.TRUE
    ) {
      const workspaceMemberCount = await this.userWorkspaceService.getUserCount(
        payload.workspaceId,
      );

      if (workspaceMemberCount && workspaceMemberCount > 1) {
        await this.userVarsService.delete({
          workspaceId: payload.workspaceId,
          key: OnboardingStepKeys.DISPLAY_INVITE_TEAM_ONBOARDING_STEP,
        });
      }
    }
  }

  @OnEvent('workspaceMember.updated')
  async handleUpdateEvent(
    payload: ObjectRecordUpdateEvent<WorkspaceMemberWorkspaceEntity>,
  ) {
    const { firstName, lastName } = payload.properties.after.name;
    const createProfileOnboardingStepValue = await this.userVarsService.get({
      userId: payload.userId,
      workspaceId: payload.workspaceId,
      key: OnboardingStepKeys.CREATE_PROFILE_ONBOARDING_STEP,
    });

    if (
      firstName + lastName !== '' &&
      createProfileOnboardingStepValue === OnboardingStepBooleanValues.TRUE
    ) {
      await this.userVarsService.delete({
        userId: payload.userId,
        workspaceId: payload.workspaceId,
        key: OnboardingStepKeys.CREATE_PROFILE_ONBOARDING_STEP,
      });
    }
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
