import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { type QueryRunner } from 'typeorm';

import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
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
  ) {}

  private isWorkspaceActivationPending(workspace: WorkspaceEntity) {
    return (
      workspace.activationStatus === WorkspaceActivationStatus.PENDING_CREATION
    );
  }

  async getOnboardingStatus(user: UserEntity, workspace: WorkspaceEntity) {
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

    if (isProfileCreationPending) {
      return OnboardingStatus.PROFILE_CREATION;
    }

    if (isConnectAccountPending) {
      return OnboardingStatus.SYNC_EMAIL;
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
