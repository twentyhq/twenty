import { Injectable } from '@nestjs/common';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { UserState } from 'src/engine/core-modules/user-state/dtos/user-state.dto';
import {
  KeyValuePairService,
  KeyValueTypes,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import { UserStates } from 'src/engine/core-modules/user-state/enums/user-states.enum';
import { UserStateEmailSyncValues } from 'src/engine/core-modules/user-state/enums/values/user-state-email-sync-values.enum';
import { UserStateResult } from 'src/engine/core-modules/user-state/dtos/user-state-result';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserStateInviteTeamValues } from 'src/engine/core-modules/user-state/enums/values/user-state-invite-team-values.enum';

@Injectable()
export class UserStateService {
  constructor(
    private readonly userWorkspaceService: UserWorkspaceService,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    private readonly keyValuePairService: KeyValuePairService<KeyValueTypes.USER_STATE>,
  ) {}

  async getUserState(user: User, workspace: Workspace): Promise<UserState> {
    let skipSyncEmailOnboardingStep = true;
    let skipInviteTeamOnboardingStep = true;

    const workspaceMemberCount =
      await this.userWorkspaceService.getWorkspaceMemberCount(workspace.id);

    if (workspaceMemberCount && workspaceMemberCount > 1) {
      await this.skipInviteEmailOnboardingStep(workspace.id);
    } else {
      const skipInviteTeam = await this.keyValuePairService.get({
        workspaceId: workspace.id,
        key: UserStates.INVITE_TEAM_ONBOARDING_STEP,
      });

      skipInviteTeamOnboardingStep =
        !!skipInviteTeam &&
        skipInviteTeam === UserStateInviteTeamValues.SKIPPED;
    }

    const connectedAccounts =
      await this.connectedAccountRepository.getAllByUserId(
        user.id,
        workspace.id,
      );

    if (connectedAccounts?.length) {
      await this.skipSyncEmailOnboardingStep(user.id, workspace.id);
    } else {
      const skipSyncEmail = await this.keyValuePairService.get({
        userId: user.id,
        workspaceId: workspace.id,
        key: UserStates.SYNC_EMAIL_ONBOARDING_STEP,
      });

      skipSyncEmailOnboardingStep =
        !!skipSyncEmail && skipSyncEmail === UserStateEmailSyncValues.SKIPPED;
    }

    return {
      skipSyncEmailOnboardingStep,
      skipInviteTeamOnboardingStep,
    };
  }

  async skipSyncEmailOnboardingStep(
    userId: string,
    workspaceId: string,
  ): Promise<UserStateResult> {
    await this.keyValuePairService.set({
      userId,
      workspaceId,
      key: UserStates.SYNC_EMAIL_ONBOARDING_STEP,
      value: UserStateEmailSyncValues.SKIPPED,
    });

    return { success: true };
  }

  async skipInviteEmailOnboardingStep(
    workspaceId: string,
  ): Promise<UserStateResult> {
    await this.keyValuePairService.set({
      workspaceId,
      key: UserStates.INVITE_TEAM_ONBOARDING_STEP,
      value: UserStateInviteTeamValues.SKIPPED,
    });

    return { success: true };
  }
}
