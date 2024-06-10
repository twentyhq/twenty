import { Injectable } from '@nestjs/common';

import { KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import { OnboardingStep } from 'src/engine/core-modules/onboarding/enums/onboarding-step.enum';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { KeyValueTypes } from 'src/engine/core-modules/key-value-pair/enums/key-value-types.enum';
import { OnboardingStepKeys } from 'src/engine/core-modules/key-value-pair/enums/keys/onboarding-step-keys.enum';
import { OnboardingStateValues } from 'src/engine/core-modules/key-value-pair/enums/values/onboarding-step-values.enum';

@Injectable()
export class OnboardingService {
  constructor(
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly keyValuePairService: KeyValuePairService<KeyValueTypes.ONBOARDING>,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
  ) {}

  async getOnboardingState(
    user: User,
    workspace: Workspace,
  ): Promise<OnboardingStep | null> {
    const syncEmailValue = await this.keyValuePairService.get({
      userId: user.id,
      workspaceId: workspace.id,
      key: OnboardingStepKeys.SYNC_EMAIL_ONBOARDING_STEP,
    });
    const inviteTeamValue = await this.keyValuePairService.get({
      userId: user.id,
      workspaceId: workspace.id,
      key: OnboardingStepKeys.INVITE_TEAM_ONBOARDING_STEP,
    });
    const isSyncEmailSkipped = syncEmailValue === OnboardingStateValues.SKIPPED;
    const connectedAccounts =
      await this.connectedAccountRepository.getAllByUserId(
        user.id,
        workspace.id,
      );

    if (!isSyncEmailSkipped && !connectedAccounts?.length) {
      return OnboardingStep.SYNC_EMAIL;
    }

    const isInviteTeamSkipped =
      inviteTeamValue === OnboardingStateValues.SKIPPED;
    const workspaceMemberCount =
      await this.userWorkspaceService.getWorkspaceMemberCount(workspace.id);

    if (
      !isInviteTeamSkipped &&
      (!workspaceMemberCount || workspaceMemberCount <= 1)
    ) {
      return OnboardingStep.INVITE_TEAM;
    }

    return null;
  }

  async skipOnboardingStep(
    userId: string,
    workspaceId: string,
    onboardingStepKey: OnboardingStepKeys,
  ) {
    await this.keyValuePairService.set({
      userId,
      workspaceId,
      key: onboardingStepKey,
      value: OnboardingStateValues.SKIPPED,
    });
  }
}
