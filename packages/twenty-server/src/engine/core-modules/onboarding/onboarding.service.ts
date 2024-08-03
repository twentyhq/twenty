import { Injectable } from '@nestjs/common';

import { BillingWorkspaceService } from 'src/engine/core-modules/billing/billing.workspace-service';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { OnboardingStatus } from 'src/engine/core-modules/onboarding/enums/onboarding-status.enum';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import {
  Workspace,
  WorkspaceActivationStatus,
} from 'src/engine/core-modules/workspace/workspace.entity';
import { isDefined } from 'src/utils/is-defined';

export enum OnboardingStepKeys {
  SYNC_EMAIL_ONBOARDING_STEP = 'SYNC_EMAIL_ONBOARDING_STEP',
  INVITE_TEAM_ONBOARDING_STEP = 'INVITE_TEAM_ONBOARDING_STEP',
  CREATE_PROFILE_ONBOARDING_STEP = 'CREATE_PROFILE_ONBOARDING_STEP',
}

export type OnboardingKeyValueTypeMap = {
  [OnboardingStepKeys.SYNC_EMAIL_ONBOARDING_STEP]: boolean;
  [OnboardingStepKeys.INVITE_TEAM_ONBOARDING_STEP]: boolean;
  [OnboardingStepKeys.CREATE_PROFILE_ONBOARDING_STEP]: boolean;
};

@Injectable()
export class OnboardingService {
  constructor(
    private readonly billingWorkspaceService: BillingWorkspaceService,
    private readonly userVarsService: UserVarsService<OnboardingKeyValueTypeMap>,
  ) {}

  private async isSubscriptionIncompleteOnboardingStatus(user: User) {
    const isBillingEnabledForWorkspace =
      await this.billingWorkspaceService.isBillingEnabledForWorkspace(
        user.defaultWorkspaceId,
      );

    if (!isBillingEnabledForWorkspace) {
      return false;
    }

    const currentBillingSubscription =
      await this.billingWorkspaceService.getCurrentBillingSubscription({
        workspaceId: user.defaultWorkspaceId,
      });

    return (
      !isDefined(currentBillingSubscription) ||
      currentBillingSubscription?.status === SubscriptionStatus.Incomplete
    );
  }

  private async isWorkspaceActivationOnboardingStatus(user: User) {
    return (
      user.defaultWorkspace.activationStatus ===
      WorkspaceActivationStatus.PENDING_CREATION
    );
  }

  private async isProfileCreationOnboardingStatus(user: User) {
    return await this.userVarsService.get({
      userId: user.id,
      workspaceId: user.defaultWorkspaceId,
      key: OnboardingStepKeys.CREATE_PROFILE_ONBOARDING_STEP,
    });
  }

  private async isSyncEmailOnboardingStatus(user: User) {
    return await this.userVarsService.get({
      userId: user.id,
      workspaceId: user.defaultWorkspaceId,
      key: OnboardingStepKeys.SYNC_EMAIL_ONBOARDING_STEP,
    });
  }

  private async isInviteTeamOnboardingStatus(workspace: Workspace) {
    return await this.userVarsService.get({
      workspaceId: workspace.id,
      key: OnboardingStepKeys.INVITE_TEAM_ONBOARDING_STEP,
    });
  }

  async getOnboardingStatus(user: User) {
    if (await this.isSubscriptionIncompleteOnboardingStatus(user)) {
      return OnboardingStatus.PLAN_REQUIRED;
    }

    if (await this.isWorkspaceActivationOnboardingStatus(user)) {
      return OnboardingStatus.WORKSPACE_ACTIVATION;
    }

    if (await this.isProfileCreationOnboardingStatus(user)) {
      return OnboardingStatus.PROFILE_CREATION;
    }

    if (await this.isSyncEmailOnboardingStatus(user)) {
      return OnboardingStatus.SYNC_EMAIL;
    }

    if (await this.isInviteTeamOnboardingStatus(user.defaultWorkspace)) {
      return OnboardingStatus.INVITE_TEAM;
    }

    return OnboardingStatus.COMPLETED;
  }

  async addSyncEmailOnboardingStep(user: User) {
    await this.userVarsService.set({
      userId: user.id,
      workspaceId: user.defaultWorkspaceId,
      key: OnboardingStepKeys.SYNC_EMAIL_ONBOARDING_STEP,
      value: true,
    });
  }

  async addInviteTeamOnboardingStep(user: User) {
    await this.userVarsService.set({
      workspaceId: user.defaultWorkspaceId,
      key: OnboardingStepKeys.INVITE_TEAM_ONBOARDING_STEP,
      value: true,
    });
  }

  async addCreateProfileOnboardingStep(user: User) {
    await this.userVarsService.set({
      userId: user.id,
      workspaceId: user.defaultWorkspaceId,
      key: OnboardingStepKeys.CREATE_PROFILE_ONBOARDING_STEP,
      value: true,
    });
  }

  async removeCreateProfileOnboardingStep(userId: string, workspaceId: string) {
    await this.userVarsService.delete({
      userId,
      workspaceId,
      key: OnboardingStepKeys.CREATE_PROFILE_ONBOARDING_STEP,
    });
  }

  async removeInviteTeamOnboardingStep(workspaceId: string) {
    await this.userVarsService.delete({
      workspaceId,
      key: OnboardingStepKeys.INVITE_TEAM_ONBOARDING_STEP,
    });
  }

  async removeSyncEmailOnboardingStep(userId: string, workspaceId: string) {
    await this.userVarsService.delete({
      userId,
      workspaceId,
      key: OnboardingStepKeys.SYNC_EMAIL_ONBOARDING_STEP,
    });
  }
}
