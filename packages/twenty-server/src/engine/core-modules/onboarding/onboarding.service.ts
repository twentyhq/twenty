import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { isNumber } from '@sniptt/guards';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { type DataSource, type QueryRunner, Repository } from 'typeorm';

import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { BillingCreditGrantService } from 'src/engine/core-modules/billing/services/billing-credit-grant.service';
import { BillingCreditService } from 'src/engine/core-modules/billing/services/billing-credit.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { ONBOARDING_INVITE_TEAM_REWARD_LOCK_OPTIONS } from 'src/engine/core-modules/onboarding/constants/onboarding-invite-team-reward-lock-options';
import { ONBOARDING_REWARD_IDEMPOTENCY_KEY_PREFIXES } from 'src/engine/core-modules/onboarding/constants/onboarding-reward-idempotency-key-prefixes';
import { ACQUIRE_ONBOARDING_STEP_TRANSITION_LOCK_STATEMENT } from 'src/engine/core-modules/onboarding/constants/acquire-onboarding-step-transition-lock-statement';
import { buildOnboardingInviteTeamRewardLockKey } from 'src/engine/core-modules/onboarding/utils/build-onboarding-invite-team-reward-lock-key.util';
import { buildOnboardingStepTransitionLockName } from 'src/engine/core-modules/onboarding/utils/build-onboarding-step-transition-lock-name.util';
import { OnboardingStatus } from 'src/engine/core-modules/onboarding/enums/onboarding-status.enum';
import {
  OnboardingException,
  OnboardingExceptionCode,
} from 'src/engine/core-modules/onboarding/onboarding.exception';
import { type ReversibleOnboardingStep } from 'src/engine/core-modules/onboarding/types/reversible-onboarding-step.type';
import { getOnboardingEnrichmentCreditRewardMicro } from 'src/engine/core-modules/onboarding/utils/get-onboarding-enrichment-credit-reward-micro.util';
import { readBookCallStepMinEmployeeCount } from 'src/engine/core-modules/onboarding/utils/read-book-call-step-min-employee-count.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export enum OnboardingStepKeys {
  ONBOARDING_CONNECT_ACCOUNT_PENDING = 'ONBOARDING_CONNECT_ACCOUNT_PENDING',
  ONBOARDING_INVITE_TEAM_PENDING = 'ONBOARDING_INVITE_TEAM_PENDING',
  ONBOARDING_CREATE_PROFILE_PENDING = 'ONBOARDING_CREATE_PROFILE_PENDING',
  ONBOARDING_BOOK_CALL_PENDING = 'ONBOARDING_BOOK_CALL_PENDING',
  ONBOARDING_BOOK_CALL_OFFERED = 'ONBOARDING_BOOK_CALL_OFFERED',
  ONBOARDING_REVERSIBLE_STEP_HISTORY = 'ONBOARDING_REVERSIBLE_STEP_HISTORY',
}

export type OnboardingKeyValueTypeMap = {
  [OnboardingStepKeys.ONBOARDING_CONNECT_ACCOUNT_PENDING]: boolean;
  [OnboardingStepKeys.ONBOARDING_INVITE_TEAM_PENDING]: boolean;
  [OnboardingStepKeys.ONBOARDING_CREATE_PROFILE_PENDING]: boolean;
  [OnboardingStepKeys.ONBOARDING_BOOK_CALL_PENDING]: boolean;
  [OnboardingStepKeys.ONBOARDING_BOOK_CALL_OFFERED]: boolean;
  [OnboardingStepKeys.ONBOARDING_REVERSIBLE_STEP_HISTORY]: ReversibleOnboardingStep[];
};

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private readonly billingService: BillingService,
    private readonly billingCreditService: BillingCreditService,
    private readonly billingCreditGrantService: BillingCreditGrantService,
    private readonly cacheLockService: CacheLockService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly userVarsService: UserVarsService<OnboardingKeyValueTypeMap>,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  private async runStepTransitionInLockedTransaction<T>(
    {
      userId,
      workspaceId,
    }: {
      userId: string;
      workspaceId: string;
    },
    runStepTransition: (queryRunner: QueryRunner) => Promise<T>,
  ): Promise<T> {
    return this.dataSource.transaction(async (entityManager) => {
      const transactionQueryRunner = entityManager.queryRunner;

      if (!isDefined(transactionQueryRunner)) {
        throw new OnboardingException(
          'Onboarding step transitions require a transaction-scoped entity manager',
          OnboardingExceptionCode.MISSING_TRANSACTION_QUERY_RUNNER,
        );
      }

      await transactionQueryRunner.query(
        ACQUIRE_ONBOARDING_STEP_TRANSITION_LOCK_STATEMENT,
        [buildOnboardingStepTransitionLockName({ userId, workspaceId })],
      );

      return runStepTransition(transactionQueryRunner);
    });
  }

  private isWorkspaceActivationPending(workspace: WorkspaceEntity) {
    return (
      workspace.activationStatus ===
        WorkspaceActivationStatus.PENDING_CREATION ||
      workspace.activationStatus === WorkspaceActivationStatus.ONGOING_CREATION
    );
  }

  async getOnboardingStatus({
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId: string;
  }): Promise<OnboardingStatus | null> {
    // Bypasses the core entity cache, which a sibling instance may hold stale right after activateWorkspace.
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!isDefined(workspace)) {
      return null;
    }

    if (this.isWorkspaceActivationPending(workspace)) {
      return OnboardingStatus.WORKSPACE_ACTIVATION;
    }

    const userVars = await this.userVarsService.getAll({
      userId,
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

    const isBookCallPending =
      userVars.get(OnboardingStepKeys.ONBOARDING_BOOK_CALL_PENDING) === true;

    if (isConnectAccountPending) {
      return OnboardingStatus.SYNC_EMAIL;
    }

    if (isProfileCreationPending) {
      return OnboardingStatus.PROFILE_CREATION;
    }

    if (isInviteTeamPending) {
      return OnboardingStatus.INVITE_TEAM;
    }

    const isPlanRequired =
      await this.billingService.isSubscriptionIncompleteOnboardingStatus(
        workspace.id,
      );

    if (
      isBookCallPending &&
      isPlanRequired &&
      isDefined(readBookCallStepMinEmployeeCount(this.twentyConfigService))
    ) {
      return OnboardingStatus.BOOK_CALL;
    }

    if (isPlanRequired) {
      return OnboardingStatus.PLAN_REQUIRED;
    }

    return OnboardingStatus.COMPLETED;
  }

  async isOnboardingInviteTeamPending({
    userId,
    workspaceId,
  }: {
    userId?: string;
    workspaceId: string;
  }): Promise<boolean> {
    return (
      (await this.userVarsService.get({
        userId,
        workspaceId,
        key: OnboardingStepKeys.ONBOARDING_INVITE_TEAM_PENDING,
      })) === true
    );
  }

  async getPreviousReversibleOnboardingStatus({
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId: string;
  }): Promise<ReversibleOnboardingStep | null> {
    const reversibleStepHistory = await this.getReversibleOnboardingStepHistory(
      {
        userId,
        workspaceId,
      },
    );

    return reversibleStepHistory[reversibleStepHistory.length - 1] ?? null;
  }

  async goBackToPreviousOnboardingStep({
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId: string;
  }) {
    await this.runStepTransitionInLockedTransaction(
      { userId, workspaceId },
      async (queryRunner) => {
        const reversibleStepHistory =
          await this.getReversibleOnboardingStepHistory({
            userId,
            workspaceId,
          });
        const previousReversibleStep =
          reversibleStepHistory[reversibleStepHistory.length - 1];

        if (!isDefined(previousReversibleStep)) {
          throw new OnboardingException(
            `No previous onboarding step to go back to for user ${userId} in workspace ${workspaceId}`,
            OnboardingExceptionCode.NO_PREVIOUS_ONBOARDING_STEP,
          );
        }

        await this.setReversibleOnboardingStepHistory(
          {
            userId,
            workspaceId,
            reversibleStepHistory: reversibleStepHistory.slice(0, -1),
          },
          queryRunner,
        );

        await this.restoreReversibleOnboardingStepPendingFlag(
          {
            userId,
            workspaceId,
            step: previousReversibleStep,
          },
          queryRunner,
        );
      },
    );

    return this.runStepTransitionInLockedTransaction(
      { userId, workspaceId },
      async () => ({
        onboardingStatus: await this.getOnboardingStatus({
          userId,
          workspaceId,
        }),
        previousOnboardingStatus:
          await this.getPreviousReversibleOnboardingStatus({
            userId,
            workspaceId,
          }),
      }),
    );
  }

  private async pushReversibleOnboardingStep(
    {
      userId,
      workspaceId,
      step,
    }: {
      userId: string;
      workspaceId: string;
      step: ReversibleOnboardingStep;
    },
    queryRunner?: QueryRunner,
  ) {
    const reversibleStepHistory = await this.getReversibleOnboardingStepHistory(
      {
        userId,
        workspaceId,
      },
    );

    await this.setReversibleOnboardingStepHistory(
      {
        userId,
        workspaceId,
        reversibleStepHistory: [...reversibleStepHistory, step],
      },
      queryRunner,
    );
  }

  private async getReversibleOnboardingStepHistory({
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId: string;
  }): Promise<ReversibleOnboardingStep[]> {
    const reversibleStepHistory = await this.userVarsService.get({
      userId,
      workspaceId,
      key: OnboardingStepKeys.ONBOARDING_REVERSIBLE_STEP_HISTORY,
    });

    return Array.isArray(reversibleStepHistory)
      ? reversibleStepHistory.filter((step) =>
          Object.values(OnboardingStatus).includes(step),
        )
      : [];
  }

  private async setReversibleOnboardingStepHistory(
    {
      userId,
      workspaceId,
      reversibleStepHistory,
    }: {
      userId: string;
      workspaceId: string;
      reversibleStepHistory: ReversibleOnboardingStep[];
    },
    queryRunner?: QueryRunner,
  ) {
    await this.userVarsService.set(
      {
        userId,
        workspaceId,
        key: OnboardingStepKeys.ONBOARDING_REVERSIBLE_STEP_HISTORY,
        value: reversibleStepHistory,
      },
      queryRunner,
    );
  }

  private async clearReversibleOnboardingStepHistoryAfterIrreversibleStep(
    {
      userId,
      workspaceId,
    }: {
      userId: string;
      workspaceId: string;
    },
    queryRunner?: QueryRunner,
  ) {
    await this.setReversibleOnboardingStepHistory(
      {
        userId,
        workspaceId,
        reversibleStepHistory: [],
      },
      queryRunner,
    );
  }

  private async restoreReversibleOnboardingStepPendingFlag(
    {
      userId,
      workspaceId,
      step,
    }: {
      userId: string;
      workspaceId: string;
      step: ReversibleOnboardingStep;
    },
    queryRunner?: QueryRunner,
  ) {
    switch (step) {
      case OnboardingStatus.SYNC_EMAIL:
        return this.setOnboardingConnectAccountPending(
          {
            userId,
            workspaceId,
            value: true,
          },
          queryRunner,
        );
      case OnboardingStatus.PROFILE_CREATION:
        return this.setOnboardingCreateProfilePending(
          {
            userId,
            workspaceId,
            value: true,
          },
          queryRunner,
        );
      case OnboardingStatus.INVITE_TEAM:
        // User-scoped: the workspace-scoped flag would pull every other member back to the invite screen.
        return this.setOnboardingInviteTeamPending(
          {
            userId,
            workspaceId,
            value: true,
          },
          queryRunner,
        );
      case OnboardingStatus.BOOK_CALL:
        return this.setOnboardingBookCallPending(
          {
            userId,
            workspaceId,
            value: true,
          },
          queryRunner,
        );
      default:
        assertUnreachable(step);
    }
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

  async completeOnboardingConnectAccountStep({
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId: string;
  }) {
    const hasClaimedConnectAccountStep =
      await this.runStepTransitionInLockedTransaction(
        { userId, workspaceId },
        async (queryRunner) => {
          const hasClaimedStep = await this.claimOnboardingConnectAccountStep(
            { userId, workspaceId },
            queryRunner,
          );

          if (!hasClaimedStep) {
            return false;
          }

          await this.clearReversibleOnboardingStepHistoryAfterIrreversibleStep(
            { userId, workspaceId },
            queryRunner,
          );

          return true;
        },
      );

    if (!hasClaimedConnectAccountStep) {
      return;
    }

    await this.creditImportContactsRewardForWorkspaceCreator({
      userId,
      workspaceId,
    });
  }

  async skipOnboardingConnectAccountStep({
    userId,
    workspaceId,
    isAutoSkipped,
  }: {
    userId: string;
    workspaceId: string;
    isAutoSkipped: boolean;
  }) {
    await this.runStepTransitionInLockedTransaction(
      { userId, workspaceId },
      async (queryRunner) => {
        const hasClaimedConnectAccountStep =
          await this.claimOnboardingConnectAccountStep(
            { userId, workspaceId },
            queryRunner,
          );

        if (!hasClaimedConnectAccountStep || isAutoSkipped) {
          return;
        }

        await this.pushReversibleOnboardingStep(
          {
            userId,
            workspaceId,
            step: OnboardingStatus.SYNC_EMAIL,
          },
          queryRunner,
        );
      },
    );
  }

  private async isWorkspaceCreator({
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId: string;
  }): Promise<boolean> {
    const earliestUserWorkspace = await this.userWorkspaceRepository.findOne({
      where: { workspaceId },
      order: { createdAt: 'ASC' },
      withDeleted: true,
    });

    return earliestUserWorkspace?.userId === userId;
  }

  private async claimOnboardingConnectAccountStep(
    {
      userId,
      workspaceId,
    }: {
      userId: string;
      workspaceId: string;
    },
    queryRunner?: QueryRunner,
  ): Promise<boolean> {
    const affectedRows = await this.userVarsService.delete(
      {
        userId,
        workspaceId,
        key: OnboardingStepKeys.ONBOARDING_CONNECT_ACCOUNT_PENDING,
      },
      queryRunner,
    );

    return isDefined(affectedRows) && affectedRows > 0;
  }

  private async creditImportContactsRewardForWorkspaceCreator({
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId: string;
  }) {
    try {
      const isWorkspaceCreator = await this.isWorkspaceCreator({
        userId,
        workspaceId,
      });

      if (!isWorkspaceCreator) {
        return;
      }

      await this.billingCreditService.grantCredits({
        workspaceId,
        amountMicro: this.twentyConfigService.get(
          'ONBOARDING_IMPORT_CONTACTS_CREDITS_REWARD',
        ),
        type: BillingCreditGrantType.ONBOARDING_REWARD,
        reason: 'Onboarding reward: import contacts',
        idempotencyKey: `${ONBOARDING_REWARD_IDEMPOTENCY_KEY_PREFIXES.importContacts}:${workspaceId}`,
      });
    } catch (error) {
      this.logger.error(
        `Failed to credit onboarding import-contacts reward for workspace ${workspaceId}`,
        error,
      );
    }
  }

  async creditInviteTeamReward({
    workspaceId,
    userId,
  }: {
    workspaceId: string;
    userId: string;
  }) {
    const idempotencyKeyPrefix = `${ONBOARDING_REWARD_IDEMPOTENCY_KEY_PREFIXES.inviteTeam}:${workspaceId}:`;

    try {
      await this.cacheLockService.withLock(
        async () => {
          const rewardedTeammatesCount =
            await this.billingCreditGrantService.countGrantsByIdempotencyKeyPrefix(
              {
                workspaceId,
                type: BillingCreditGrantType.ONBOARDING_REWARD,
                idempotencyKeyPrefix,
              },
            );

          if (
            rewardedTeammatesCount >=
            this.twentyConfigService.get('ONBOARDING_INVITE_TEAM_MAX_INVITES')
          ) {
            return;
          }

          await this.billingCreditService.grantCredits({
            workspaceId,
            amountMicro: this.twentyConfigService.get(
              'ONBOARDING_INVITE_TEAM_CREDITS_REWARD_PER_USER',
            ),
            type: BillingCreditGrantType.ONBOARDING_REWARD,
            reason: 'Onboarding reward: invited teammate signed up',
            idempotencyKey: `${idempotencyKeyPrefix}${userId}`,
          });
        },
        buildOnboardingInviteTeamRewardLockKey(workspaceId),
        ONBOARDING_INVITE_TEAM_REWARD_LOCK_OPTIONS,
      );
    } catch (error) {
      this.logger.error(
        `Failed to credit onboarding invite reward for workspace ${workspaceId}`,
        error,
      );

      this.exceptionHandlerService.captureExceptions([error], {
        workspace: { id: workspaceId },
      });
    }
  }

  async setOnboardingInviteTeamPending(
    {
      userId,
      workspaceId,
      value,
    }: {
      userId?: string;
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
          key: OnboardingStepKeys.ONBOARDING_INVITE_TEAM_PENDING,
        },
        queryRunner,
      );

      return;
    }

    await this.userVarsService.set(
      {
        userId,
        workspaceId,
        key: OnboardingStepKeys.ONBOARDING_INVITE_TEAM_PENDING,
        value: true,
      },
      queryRunner,
    );
  }

  async creditEnrichmentQualificationReward({
    workspaceId,
    employeeCount,
  }: {
    workspaceId: string;
    employeeCount: number | null;
  }) {
    // Reading the tiers throws on malformed config, so it stays guarded: a broken reward must not break onboarding.
    try {
      const { amountMicro, malformedTierKeys } =
        getOnboardingEnrichmentCreditRewardMicro({
          employeeCount,
          tiers: this.twentyConfigService.get(
            'ONBOARDING_ENRICHMENT_CREDIT_REWARD_TIERS',
          ),
        });

      if (malformedTierKeys.length > 0) {
        // Otherwise a dropped tier would silently under-pay every workspace that should have matched it.
        this.exceptionHandlerService.captureExceptions([
          new Error(
            `Ignored malformed ONBOARDING_ENRICHMENT_CREDIT_REWARD_TIERS entries: ${malformedTierKeys.join(', ')}`,
          ),
        ]);
      }

      if (!isDefined(amountMicro)) {
        return;
      }

      await this.billingCreditService.grantCredits({
        workspaceId,
        amountMicro,
        type: BillingCreditGrantType.ONBOARDING_REWARD,
        reason: 'Onboarding reward: enrichment-qualified workspace',
        // Keyed on the workspace, not the user, so re-runs and later members replay instead of topping up.
        idempotencyKey: `${ONBOARDING_REWARD_IDEMPOTENCY_KEY_PREFIXES.enrichmentQualification}:${workspaceId}`,
      });
    } catch (error) {
      this.logger.error(
        `Failed to credit onboarding enrichment qualification reward for workspace ${workspaceId}`,
        error,
      );

      this.exceptionHandlerService.captureExceptions([error], {
        workspace: { id: workspaceId },
      });
    }
  }

  async isOnboardingBookCallPending({
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId: string;
  }): Promise<boolean> {
    if (
      !isDefined(readBookCallStepMinEmployeeCount(this.twentyConfigService))
    ) {
      return false;
    }

    return (
      (await this.userVarsService.get({
        userId,
        workspaceId,
        key: OnboardingStepKeys.ONBOARDING_BOOK_CALL_PENDING,
      })) === true
    );
  }

  async setOnboardingBookCallPending(
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
          key: OnboardingStepKeys.ONBOARDING_BOOK_CALL_PENDING,
        },
        queryRunner,
      );

      return;
    }

    await this.userVarsService.set(
      {
        userId,
        workspaceId,
        key: OnboardingStepKeys.ONBOARDING_BOOK_CALL_PENDING,
        value: true,
      },
      queryRunner,
    );
  }

  async completeOnboardingBookCallStep({
    userId,
    workspaceId,
    hasBookedCall,
    isAutoSkipped,
  }: {
    userId: string;
    workspaceId: string;
    hasBookedCall: boolean;
    isAutoSkipped: boolean;
  }) {
    await this.runStepTransitionInLockedTransaction(
      { userId, workspaceId },
      async (queryRunner) => {
        const hasClaimedBookCallStep = await this.claimOnboardingBookCallStep(
          { userId, workspaceId },
          queryRunner,
        );

        if (!hasClaimedBookCallStep || isAutoSkipped) {
          return;
        }

        if (hasBookedCall) {
          await this.clearReversibleOnboardingStepHistoryAfterIrreversibleStep(
            { userId, workspaceId },
            queryRunner,
          );

          return;
        }

        await this.pushReversibleOnboardingStep(
          {
            userId,
            workspaceId,
            step: OnboardingStatus.BOOK_CALL,
          },
          queryRunner,
        );
      },
    );
  }

  private async claimOnboardingBookCallStep(
    {
      userId,
      workspaceId,
    }: {
      userId: string;
      workspaceId: string;
    },
    queryRunner?: QueryRunner,
  ): Promise<boolean> {
    const affectedRows = await this.userVarsService.delete(
      {
        userId,
        workspaceId,
        key: OnboardingStepKeys.ONBOARDING_BOOK_CALL_PENDING,
      },
      queryRunner,
    );

    return isDefined(affectedRows) && affectedRows > 0;
  }

  async setOnboardingBookCallPendingIfQualified({
    userId,
    workspaceId,
    employeeCount,
  }: {
    userId: string;
    workspaceId: string;
    employeeCount: number | null;
  }): Promise<boolean> {
    const minEmployeeCount = readBookCallStepMinEmployeeCount(
      this.twentyConfigService,
    );

    if (
      !isDefined(minEmployeeCount) ||
      !isNumber(employeeCount) ||
      employeeCount < minEmployeeCount
    ) {
      return false;
    }

    try {
      return await this.dataSource.transaction(async (entityManager) => {
        const { queryRunner } = entityManager;

        if (!isDefined(queryRunner)) {
          throw new Error('Transaction entity manager has no query runner');
        }

        // Single-winner gate: a concurrent enrichment must not resurrect a step the user already skipped.
        const hasClaimedBookCallOffer =
          await this.userVarsService.setIfNotExists(
            {
              userId,
              workspaceId,
              key: OnboardingStepKeys.ONBOARDING_BOOK_CALL_OFFERED,
              value: true,
            },
            queryRunner,
          );

        if (!hasClaimedBookCallOffer) {
          return false;
        }

        await this.setOnboardingBookCallPending(
          {
            userId,
            workspaceId,
            value: true,
          },
          queryRunner,
        );

        return true;
      });
    } catch (error) {
      this.logger.error(
        `Failed to flag the book-call onboarding step for user ${userId} in workspace ${workspaceId}`,
        error,
      );

      return false;
    }
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

    await this.runStepTransitionInLockedTransaction(
      { userId, workspaceId },
      async (queryRunner) => {
        const hasClaimedCreateProfileStep =
          await this.claimOnboardingCreateProfileStep(
            { userId, workspaceId },
            queryRunner,
          );

        if (!hasClaimedCreateProfileStep) {
          return;
        }

        await this.pushReversibleOnboardingStep(
          {
            userId,
            workspaceId,
            step: OnboardingStatus.PROFILE_CREATION,
          },
          queryRunner,
        );
      },
    );
  }

  private async claimOnboardingCreateProfileStep(
    {
      userId,
      workspaceId,
    }: {
      userId: string;
      workspaceId: string;
    },
    queryRunner?: QueryRunner,
  ): Promise<boolean> {
    const affectedRows = await this.userVarsService.delete(
      {
        userId,
        workspaceId,
        key: OnboardingStepKeys.ONBOARDING_CREATE_PROFILE_PENDING,
      },
      queryRunner,
    );

    return isDefined(affectedRows) && affectedRows > 0;
  }

  async completeOnboardingInviteTeamStep({
    userId,
    workspaceId,
    hasSentInvitations,
  }: {
    userId: string;
    workspaceId: string;
    hasSentInvitations: boolean;
  }) {
    await this.runStepTransitionInLockedTransaction(
      { userId, workspaceId },
      async (queryRunner) => {
        const hasClaimedInviteTeamStep =
          await this.claimOnboardingInviteTeamStep(
            { workspaceId },
            queryRunner,
          );

        if (!hasClaimedInviteTeamStep) {
          return;
        }

        if (hasSentInvitations) {
          await this.clearReversibleOnboardingStepHistoryAfterIrreversibleStep(
            { userId, workspaceId },
            queryRunner,
          );

          return;
        }

        await this.pushReversibleOnboardingStep(
          {
            userId,
            workspaceId,
            step: OnboardingStatus.INVITE_TEAM,
          },
          queryRunner,
        );
      },
    );
  }

  private async claimOnboardingInviteTeamStep(
    {
      workspaceId,
    }: {
      workspaceId: string;
    },
    queryRunner?: QueryRunner,
  ): Promise<boolean> {
    const affectedRows = await this.userVarsService.delete(
      {
        workspaceId,
        key: OnboardingStepKeys.ONBOARDING_INVITE_TEAM_PENDING,
      },
      queryRunner,
    );

    return isDefined(affectedRows) && affectedRows > 0;
  }
}
