import { Injectable } from '@nestjs/common';

import { KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import { OnboardingStatus } from 'src/engine/core-modules/onboarding/enums/onboarding-status.enum';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { WorkspaceMemberRepository } from 'src/modules/workspace-member/repositories/workspace-member.repository';
import { WorkspaceManagerService } from 'src/engine/workspace-manager/workspace-manager.service';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { BillingService } from 'src/engine/core-modules/billing/billing.service';

enum OnboardingStepValues {
  SKIPPED = 'SKIPPED',
}

enum OnboardingStepKeys {
  SYNC_EMAIL_ONBOARDING_STEP = 'SYNC_EMAIL_ONBOARDING_STEP',
  INVITE_TEAM_ONBOARDING_STEP = 'INVITE_TEAM_ONBOARDING_STEP',
}

type OnboardingKeyValueType = {
  [OnboardingStepKeys.SYNC_EMAIL_ONBOARDING_STEP]: OnboardingStepValues;
  [OnboardingStepKeys.INVITE_TEAM_ONBOARDING_STEP]: OnboardingStepValues;
};

@Injectable()
export class OnboardingService {
  constructor(
    private readonly billingService: BillingService,
    private readonly workspaceManagerService: WorkspaceManagerService,
    private readonly environmentService: EnvironmentService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly keyValuePairService: KeyValuePairService<OnboardingKeyValueType>,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectObjectMetadataRepository(WorkspaceMemberWorkspaceEntity)
    private readonly workspaceMemberRepository: WorkspaceMemberRepository,
  ) {}

  private async isSubscriptionIncompleteOnboardingStatus(user: User) {
    return (
      this.environmentService.get('IS_BILLING_ENABLED') &&
      user.defaultWorkspace.subscriptionStatus === 'incomplete'
    );
  }

  private async isWorkspaceActivationOnboardingStatus(user: User) {
    return !(await this.workspaceManagerService.doesDataSourceExist(
      user.defaultWorkspaceId,
    ));
  }

  private async isProfileCreationOnboardingStatus(user: User) {
    const workspaceMember = await this.workspaceMemberRepository.getById(
      user.id,
      user.defaultWorkspaceId,
    );

    return (
      workspaceMember &&
      (!workspaceMember.name.firstName || !workspaceMember.name.lastName)
    );
  }

  private async isSyncEmailOnboardingStatus(user: User) {
    const syncEmailValue = await this.keyValuePairService.get({
      userId: user.id,
      workspaceId: user.defaultWorkspaceId,
      key: OnboardingStepKeys.SYNC_EMAIL_ONBOARDING_STEP,
    });
    const isSyncEmailSkipped = syncEmailValue === OnboardingStepValues.SKIPPED;
    const connectedAccounts =
      await this.connectedAccountRepository.getAllByUserId(
        user.id,
        user.defaultWorkspaceId,
      );

    return !isSyncEmailSkipped && !connectedAccounts?.length;
  }

  private async isInviteTeamOnboardingStatus(workspace: Workspace) {
    const inviteTeamValue = await this.keyValuePairService.get({
      workspaceId: workspace.id,
      key: OnboardingStepKeys.INVITE_TEAM_ONBOARDING_STEP,
    });
    const isInviteTeamSkipped =
      inviteTeamValue === OnboardingStepValues.SKIPPED;
    const workspaceMemberCount =
      await this.userWorkspaceService.getWorkspaceMemberCount();

    return (
      !isInviteTeamSkipped &&
      (!workspaceMemberCount || workspaceMemberCount <= 1)
    );
  }

  private async isSubscriptionCanceledOnboardingStatus(user: User) {
    return (
      this.environmentService.get('IS_BILLING_ENABLED') &&
      user.defaultWorkspace.subscriptionStatus === 'canceled'
    );
  }

  private async isSubscriptionPastDueOnboardingStatus(user: User) {
    return (
      this.environmentService.get('IS_BILLING_ENABLED') &&
      user.defaultWorkspace.subscriptionStatus === 'past_due'
    );
  }

  private async isSubscriptionUnpaidOnboardingStatus(user: User) {
    return (
      this.environmentService.get('IS_BILLING_ENABLED') &&
      user.defaultWorkspace.subscriptionStatus === 'unpaid'
    );
  }

  private async isCompletedWithoutSubscriptionOnboardingStatus(user: User) {
    const currentBillingSubscription =
      await this.billingService.getCurrentBillingSubscription({
        workspaceId: user.defaultWorkspaceId,
      });

    return (
      this.environmentService.get('IS_BILLING_ENABLED') &&
      !currentBillingSubscription
    );
  }

  async getOnboardingStatus(user?: User) {
    if (!user) {
      return OnboardingStatus.USER_CREATION;
    }

    if (await this.isSubscriptionIncompleteOnboardingStatus(user)) {
      return OnboardingStatus.SUBSCRIPTION_INCOMPLETE;
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

    if (await this.isSubscriptionCanceledOnboardingStatus(user)) {
      return OnboardingStatus.SUBSCRIPTION_CANCELED;
    }

    if (await this.isSubscriptionPastDueOnboardingStatus(user)) {
      return OnboardingStatus.SUBSCRIPTION_PAST_DUE;
    }

    if (await this.isSubscriptionUnpaidOnboardingStatus(user)) {
      return OnboardingStatus.SUBSCRIPTION_UNPAID;
    }

    if (await this.isCompletedWithoutSubscriptionOnboardingStatus(user)) {
      return OnboardingStatus.COMPLETED_WITHOUT_SUBSCRIPTION;
    }

    return OnboardingStatus.COMPLETED;
  }

  async skipInviteTeamOnboardingStep(workspaceId: string) {
    await this.keyValuePairService.set({
      workspaceId,
      key: OnboardingStepKeys.INVITE_TEAM_ONBOARDING_STEP,
      value: OnboardingStepValues.SKIPPED,
    });
  }

  async skipSyncEmailOnboardingStep(userId: string, workspaceId: string) {
    await this.keyValuePairService.set({
      userId,
      workspaceId,
      key: OnboardingStepKeys.SYNC_EMAIL_ONBOARDING_STEP,
      value: OnboardingStepValues.SKIPPED,
    });
  }
}
