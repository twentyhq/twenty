import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { type QueryRunner, Repository } from 'typeorm';

import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { OnboardingStatus } from 'src/engine/core-modules/onboarding/enums/onboarding-status.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export enum OnboardingStepKeys {
  ONBOARDING_CONNECT_ACCOUNT_PENDING = 'ONBOARDING_CONNECT_ACCOUNT_PENDING',
  ONBOARDING_INVITE_TEAM_PENDING = 'ONBOARDING_INVITE_TEAM_PENDING',
  ONBOARDING_CREATE_PROFILE_PENDING = 'ONBOARDING_CREATE_PROFILE_PENDING',
  ONBOARDING_BOOK_ONBOARDING_PENDING = 'ONBOARDING_BOOK_ONBOARDING_PENDING',
}

export type OnboardingKeyValueTypeMap = {
  [OnboardingStepKeys.ONBOARDING_CONNECT_ACCOUNT_PENDING]: boolean;
  [OnboardingStepKeys.ONBOARDING_INVITE_TEAM_PENDING]: boolean;
  [OnboardingStepKeys.ONBOARDING_CREATE_PROFILE_PENDING]: boolean;
  [OnboardingStepKeys.ONBOARDING_BOOK_ONBOARDING_PENDING]: boolean;
};

@Injectable()
export class OnboardingService {
  constructor(
    private readonly billingService: BillingService,
    private readonly userVarsService: UserVarsService<OnboardingKeyValueTypeMap>,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly featureFlagService: FeatureFlagService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  private isWorkspaceActivationPending(workspace: WorkspaceEntity) {
    return (
      workspace.activationStatus === WorkspaceActivationStatus.PENDING_CREATION
    );
  }

  async getOnboardingStatus({
    user,
    workspaceId,
  }: {
    user: UserEntity;
    workspaceId: string;
  }): Promise<OnboardingStatus | null> {
    // We always read the workspace directly from the database here (bypassing
    // the per-instance core entity cache) so that onboardingStatus reflects the
    // freshest activationStatus right after activateWorkspace, even when a
    // sibling server instance still has a stale cached workspace.
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!isDefined(workspace)) {
      return null;
    }

    if (
      await this.billingService.isSubscriptionIncompleteOnboardingStatus(
        workspace.id,
      )
    ) {
      return OnboardingStatus.PLAN_REQUIRED;
    }

    if (this.isWorkspaceActivationPending(workspace)) {
      return OnboardingStatus.WORKSPACE_ACTIVATION;
    }

    const userVars = await this.userVarsService.getAll({
      userId: user.id,
      workspaceId: workspace.id,
    });

    const isProfileCreationPending =
      userVars.get(OnboardingStepKeys.ONBOARDING_CREATE_PROFILE_PENDING) ===
      true;

    const isConnectAccountPending =
      userVars.get(OnboardingStepKeys.ONBOARDING_CONNECT_ACCOUNT_PENDING) ===
      true;

    const isInviteTeamPending =
      userVars.get(OnboardingStepKeys.ONBOARDING_INVITE_TEAM_PENDING) === true;

    const isBookOnboardingPending =
      userVars.get(OnboardingStepKeys.ONBOARDING_BOOK_ONBOARDING_PENDING) ===
      true;

    const isInviteSuggestionsEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_ONBOARDING_INVITE_SUGGESTIONS_ENABLED,
        workspace.id,
      );

    // When invite suggestions are enabled we surface the account connection
    // step before profile creation, so the calendar sync gets a head start and
    // we can prefill teammates by the time the invite step is reached.
    if (isInviteSuggestionsEnabled) {
      if (isConnectAccountPending) {
        return OnboardingStatus.SYNC_EMAIL;
      }

      if (isProfileCreationPending) {
        return OnboardingStatus.PROFILE_CREATION;
      }
    } else {
      if (isProfileCreationPending) {
        return OnboardingStatus.PROFILE_CREATION;
      }

      if (isConnectAccountPending) {
        return OnboardingStatus.SYNC_EMAIL;
      }
    }

    if (isInviteTeamPending) {
      return OnboardingStatus.INVITE_TEAM;
    }

    if (isBookOnboardingPending) {
      const calendarBookingPageId = this.twentyConfigService.get(
        'CALENDAR_BOOKING_PAGE_ID',
      );
      const isBookingConfigured =
        isDefined(calendarBookingPageId) &&
        isNonEmptyString(calendarBookingPageId);

      if (!isBookingConfigured) {
        await this.userVarsService.delete({
          workspaceId: workspace.id,
          key: OnboardingStepKeys.ONBOARDING_BOOK_ONBOARDING_PENDING,
        });

        return OnboardingStatus.COMPLETED;
      }

      return OnboardingStatus.BOOK_ONBOARDING;
    }

    return OnboardingStatus.COMPLETED;
  }

  async isOnboardingConnectAccountPending({
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId: string;
  }): Promise<boolean> {
    const value = await this.userVarsService.get({
      userId,
      workspaceId,
      key: OnboardingStepKeys.ONBOARDING_CONNECT_ACCOUNT_PENDING,
    });

    return value === true;
  }

  // Whether completing this account connection should trigger the fast
  // teammate lookup used to prefill the invite step. Only true while the user
  // is still on the onboarding connect step and the feature is enabled.
  async shouldComputeInviteSuggestionsOnConnect({
    userId,
    workspaceId,
  }: {
    userId?: string;
    workspaceId: string;
  }): Promise<boolean> {
    if (!isDefined(userId)) {
      return false;
    }

    const isConnectAccountPending =
      await this.isOnboardingConnectAccountPending({ userId, workspaceId });

    if (!isConnectAccountPending) {
      return false;
    }

    return this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_ONBOARDING_INVITE_SUGGESTIONS_ENABLED,
      workspaceId,
    );
  }

  async setOnboardingConnectAccountPending(
    {
      userId,
      workspaceId,
      value,
    }: {
      userId: string;
      workspaceId: string;
      value: boolean;
    },
    queryRunner?: QueryRunner,
  ) {
    if (!value) {
      await this.userVarsService.delete(
        {
          userId,
          workspaceId,
          key: OnboardingStepKeys.ONBOARDING_CONNECT_ACCOUNT_PENDING,
        },
        queryRunner,
      );

      return;
    }

    await this.userVarsService.set(
      {
        userId,
        workspaceId: workspaceId,
        key: OnboardingStepKeys.ONBOARDING_CONNECT_ACCOUNT_PENDING,
        value: true,
      },
      queryRunner,
    );
  }

  async setOnboardingInviteTeamPending(
    {
      workspaceId,
      value,
    }: {
      workspaceId: string;
      value: boolean;
    },
    queryRunner?: QueryRunner,
  ) {
    if (!value) {
      await this.userVarsService.delete(
        {
          workspaceId,
          key: OnboardingStepKeys.ONBOARDING_INVITE_TEAM_PENDING,
        },
        queryRunner,
      );

      return;
    }

    await this.userVarsService.set(
      {
        workspaceId,
        key: OnboardingStepKeys.ONBOARDING_INVITE_TEAM_PENDING,
        value: true,
      },
      queryRunner,
    );
  }

  async setOnboardingCreateProfilePending(
    {
      userId,
      workspaceId,
      value,
    }: {
      userId: string;
      workspaceId: string;
      value: boolean;
    },
    queryRunner?: QueryRunner,
  ) {
    if (!value) {
      await this.userVarsService.delete(
        {
          userId,
          workspaceId,
          key: OnboardingStepKeys.ONBOARDING_CREATE_PROFILE_PENDING,
        },
        queryRunner,
      );

      return;
    }

    await this.userVarsService.set(
      {
        userId,
        workspaceId,
        key: OnboardingStepKeys.ONBOARDING_CREATE_PROFILE_PENDING,
        value: true,
      },
      queryRunner,
    );
  }

  async completeOnboardingProfileStepIfNameProvided({
    userId,
    workspaceId,
    firstName,
    lastName,
  }: {
    userId?: string;
    workspaceId: string;
    firstName?: string;
    lastName?: string;
  }) {
    if (!isDefined(userId)) {
      return;
    }

    const hasProvidedNamePart =
      (isDefined(firstName) && firstName !== '') ||
      (isDefined(lastName) && lastName !== '');
    if (!hasProvidedNamePart) {
      return;
    }

    await this.setOnboardingCreateProfilePending({
      userId,
      workspaceId,
      value: false,
    });
  }

  async setOnboardingBookOnboardingPending({
    workspaceId,
    value,
  }: {
    workspaceId: string;
    value: boolean;
  }) {
    const calendarBookingPageId = this.twentyConfigService.get(
      'CALENDAR_BOOKING_PAGE_ID',
    );

    const isBookingConfigured =
      isDefined(calendarBookingPageId) &&
      isNonEmptyString(calendarBookingPageId);

    if (!value || !isBookingConfigured) {
      await this.userVarsService.delete({
        workspaceId,
        key: OnboardingStepKeys.ONBOARDING_BOOK_ONBOARDING_PENDING,
      });

      return;
    }

    await this.userVarsService.set({
      workspaceId,
      key: OnboardingStepKeys.ONBOARDING_BOOK_ONBOARDING_PENDING,
      value: true,
    });
  }
}
