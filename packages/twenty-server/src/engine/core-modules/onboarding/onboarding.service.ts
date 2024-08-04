import { Injectable } from '@nestjs/common';

import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { OnboardingStatus } from 'src/engine/core-modules/onboarding/enums/onboarding-status.enum';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceActivationStatus } from 'src/engine/core-modules/workspace/workspace.entity';

export enum OnboardingStepKeys {
  ONBOARDING_CONNECT_ACCOUNT_COMPLETE = 'ONBOARDING_CONNECT_ACCOUNT_COMPLETE',
  ONBOARDING_INVITE_TEAM_COMPLETE = 'ONBOARDING_INVITE_TEAM_COMPLETE',
  ONBOARDING_CREATE_PROFILE_COMPLETE = 'ONBOARDING_CREATE_PROFILE_COMPLETE',
}

export type OnboardingKeyValueTypeMap = {
  [OnboardingStepKeys.ONBOARDING_CONNECT_ACCOUNT_COMPLETE]: boolean;
  [OnboardingStepKeys.ONBOARDING_INVITE_TEAM_COMPLETE]: boolean;
  [OnboardingStepKeys.ONBOARDING_CREATE_PROFILE_COMPLETE]: boolean;
};

@Injectable()
export class OnboardingService {
  constructor(
    private readonly billingService: BillingService,
    private readonly userVarsService: UserVarsService<OnboardingKeyValueTypeMap>,
  ) {}

  private async isSubscriptionIncompleteOnboardingStatus(user: User) {
    return !this.billingService.hasWorkspaceActiveSubscriptionOrFreeAccess(
      user.defaultWorkspaceId,
    );
  }

  private async isWorkspaceActivationOnboardingStatus(user: User) {
    return (
      user.defaultWorkspace.activationStatus ===
      WorkspaceActivationStatus.PENDING_CREATION
    );
  }

  async getOnboardingStatus(user: User) {
    if (await this.isSubscriptionIncompleteOnboardingStatus(user)) {
      return OnboardingStatus.PLAN_REQUIRED;
    }

    if (await this.isWorkspaceActivationOnboardingStatus(user)) {
      return OnboardingStatus.WORKSPACE_ACTIVATION;
    }

    const userVars = await this.userVarsService.getAll({
      userId: user.id,
      workspaceId: user.defaultWorkspaceId,
    });

    const isProfileCreationComplete =
      userVars.get(OnboardingStepKeys.ONBOARDING_CREATE_PROFILE_COMPLETE) ===
      true;

    const isConnectAccountComplete =
      userVars.get(OnboardingStepKeys.ONBOARDING_CONNECT_ACCOUNT_COMPLETE) ===
      true;

    const isInviteTeamComplete =
      userVars.get(OnboardingStepKeys.ONBOARDING_INVITE_TEAM_COMPLETE) === true;

    if (!isProfileCreationComplete) {
      return OnboardingStatus.PROFILE_CREATION;
    }

    if (!isConnectAccountComplete) {
      return OnboardingStatus.SYNC_EMAIL;
    }

    if (!isInviteTeamComplete) {
      return OnboardingStatus.INVITE_TEAM;
    }

    return OnboardingStatus.COMPLETED;
  }

  async toggleOnboardingConnectAccountCompletion({
    userId,
    workspaceId,
    value,
  }: {
    userId: string;
    workspaceId: string;
    value: boolean;
  }) {
    await this.userVarsService.set({
      userId,
      workspaceId: workspaceId,
      key: OnboardingStepKeys.ONBOARDING_CONNECT_ACCOUNT_COMPLETE,
      value,
    });
  }

  async toggleOnboardingInviteTeamCompletion({
    workspaceId,
    value,
  }: {
    workspaceId: string;
    value: boolean;
  }) {
    await this.userVarsService.set({
      workspaceId,
      key: OnboardingStepKeys.ONBOARDING_INVITE_TEAM_COMPLETE,
      value,
    });
  }

  async toggleOnboardingCreateProfileCompletion({
    userId,
    workspaceId,
    value,
  }: {
    userId: string;
    workspaceId: string;
    value: boolean;
  }) {
    await this.userVarsService.set({
      userId,
      workspaceId,
      key: OnboardingStepKeys.ONBOARDING_CREATE_PROFILE_COMPLETE,
      value,
    });
  }
}
