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
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserStateOnboardingStepValues } from 'src/engine/core-modules/user-state/enums/values/user-state-onboarding-step-values.enum';

const getNextOnboardingStep = (
  onboardingStep: UserStateOnboardingStepValues,
): UserStateOnboardingStepValues | undefined => {
  if (onboardingStep === UserStateOnboardingStepValues.SYNC_EMAIL) {
    return UserStateOnboardingStepValues.INVITE_TEAM;
  }

  return;
};

@Injectable()
export class UserStateService {
  constructor(
    private readonly userWorkspaceService: UserWorkspaceService,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    private readonly keyValuePairService: KeyValuePairService<KeyValueTypes.USER_STATE>,
  ) {}

  async getUserState(user: User, workspace: Workspace): Promise<UserState> {
    await this.updateOnboardingStep(user.id, workspace.id);
    const onboardingStep =
      (await this.keyValuePairService.get({
        userId: user.id,
        workspaceId: workspace.id,
        key: UserStates.ONBOARDING_STEP,
      })) || null;

    return {
      onboardingStep,
    };
  }

  private async updateOnboardingStep(userId: string, workspaceId: string) {
    const onboardingStep = await this.keyValuePairService.get({
      userId,
      workspaceId,
      key: UserStates.ONBOARDING_STEP,
    });

    if (!onboardingStep) {
      return;
    }

    const workspaceMemberCount =
      await this.userWorkspaceService.getWorkspaceMemberCount(workspaceId);

    if (workspaceMemberCount && workspaceMemberCount > 1) {
      await this.skipOnboardingStep(
        userId,
        workspaceId,
        UserStateOnboardingStepValues.INVITE_TEAM,
      );
    }

    const connectedAccounts =
      await this.connectedAccountRepository.getAllByUserId(userId, workspaceId);

    if (connectedAccounts?.length) {
      await this.skipOnboardingStep(
        userId,
        workspaceId,
        UserStateOnboardingStepValues.SYNC_EMAIL,
      );
    }
  }

  async initOnboardingStep(userId: string, workspaceId: string) {
    await this.keyValuePairService.set({
      userId,
      workspaceId,
      key: UserStates.ONBOARDING_STEP,
      value: UserStateOnboardingStepValues.SYNC_EMAIL,
    });
  }

  async skipOnboardingStep(
    userId: string,
    workspaceId: string,
    onboardingStep: UserStateOnboardingStepValues,
  ) {
    const nextStep = getNextOnboardingStep(onboardingStep);

    if (!nextStep) {
      await this.keyValuePairService.delete({
        userId,
        workspaceId,
        key: UserStates.ONBOARDING_STEP,
      });
    } else {
      await this.keyValuePairService.set({
        userId,
        workspaceId,
        key: UserStates.ONBOARDING_STEP,
        value: nextStep,
      });
    }
  }
}
