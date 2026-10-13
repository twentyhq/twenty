/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { NO_BILLING_SUBSCRIPTION } from 'src/engine/core-modules/billing/constants/no-billing-subscription.constant';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { type FlatBillingSubscription } from 'src/engine/core-modules/billing/types/flat-billing-subscription.type';
import { computeMemberCreditsSlice } from 'src/engine/core-modules/billing/utils/compute-member-credits-slice.util';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type CreditAllowance } from 'src/engine/core-modules/usage-limit/types/credit-allowance.type';
import { type MemberCreditsAllowance } from 'src/engine/core-modules/usage-limit/types/member-credits-allowance.type';
import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class BillingCreditAllowanceService {
  private readonly logger = new Logger(BillingCreditAllowanceService.name);

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
  ) {}

  async isCreditAllowanceEnabled(): Promise<boolean> {
    return this.twentyConfigService.get('IS_BILLING_ENABLED');
  }

  async getCreditAllowancePeriod(
    workspaceId: string,
  ): Promise<UsagePeriod | null> {
    const subscription = await this.findCurrentBillingSubscription(workspaceId);

    if (!isDefined(subscription)) {
      return null;
    }

    return {
      periodStart: new Date(subscription.currentPeriodStart),
      periodEnd: new Date(subscription.currentPeriodEnd),
    };
  }

  async getCreditAllowance(
    workspaceId: string,
    {
      shouldThrowOnMemberCreditsFailure = false,
    }: { shouldThrowOnMemberCreditsFailure?: boolean } = {},
  ): Promise<CreditAllowance | null> {
    const subscription = await this.findCurrentBillingSubscription(workspaceId);

    if (
      !isDefined(subscription) ||
      !isDefined(subscription.planAllowanceMicro)
    ) {
      return null;
    }

    return {
      periodStart: new Date(subscription.currentPeriodStart),
      periodEnd: new Date(subscription.currentPeriodEnd),
      planAllowanceMicro: subscription.planAllowanceMicro,
      grants: subscription.creditGrants,
      memberCredits: await this.findMemberCreditsAllowance({
        workspaceId,
        subscription,
        shouldThrowOnFailure: shouldThrowOnMemberCreditsFailure,
      }),
    };
  }

  async getPlanKey(workspaceId: string): Promise<string | null> {
    const subscription = await this.findCurrentBillingSubscription(workspaceId);

    return subscription?.planKey ?? null;
  }

  // Never throws unless asked: a member credits failure must not take the workspace allowance down with it
  private async findMemberCreditsAllowance({
    workspaceId,
    subscription,
    shouldThrowOnFailure,
  }: {
    workspaceId: string;
    subscription: FlatBillingSubscription;
    shouldThrowOnFailure: boolean;
  }): Promise<MemberCreditsAllowance | null> {
    try {
      const amountMicro =
        this.findApplicableMemberCreditsAmountMicro(subscription);

      if (!isDefined(amountMicro)) {
        return null;
      }

      // Its own cache call, inside the try: a featureFlagsMap compute failure must only disable member credits
      const isMemberCreditsEnabled =
        await this.featureFlagService.isFeatureEnabled(
          FeatureFlagKey.IS_MEMBER_CREDITS_ENABLED,
          workspaceId,
        );

      if (!isMemberCreditsEnabled) {
        return null;
      }

      const slice = computeMemberCreditsSlice({
        currentPeriodStart: new Date(subscription.currentPeriodStart),
        currentPeriodEnd: new Date(subscription.currentPeriodEnd),
        interval: subscription.interval,
        status: subscription.status,
        now: new Date(),
      });

      if (!isDefined(slice)) {
        return null;
      }

      const workspace = await this.coreEntityCacheService.get(
        'workspaceEntity',
        workspaceId,
      );

      return {
        ...slice,
        amountMicro,
        // Undefined until the upgrade command has run and the cached entry is refreshed
        fallback: workspace?.memberCreditsFallback ?? 'WORKSPACE_CREDITS',
      };
    } catch (error) {
      if (shouldThrowOnFailure) {
        throw error;
      }

      this.logger.error(
        `Member credits allowance unavailable for workspace ${workspaceId}`,
        error,
      );

      return null;
    }
  }

  // Read live so a trial config change applies at the next admission, not at the next cache recompute
  private findApplicableMemberCreditsAmountMicro(
    subscription: FlatBillingSubscription,
  ): number | null {
    // Also undefined, despite the type, on entries cached by a previous release
    if (!isDefined(subscription.memberCreditsAmountMicro)) {
      return null;
    }

    if (subscription.status !== SubscriptionStatus.Trialing) {
      return subscription.memberCreditsAmountMicro;
    }

    const trialAmountMicro = this.twentyConfigService.get(
      'BILLING_FREE_MEMBER_CREDITS_FOR_TRIAL_PERIOD',
    );

    return trialAmountMicro > 0 ? trialAmountMicro : null;
  }

  private async findCurrentBillingSubscription(
    workspaceId: string,
  ): Promise<FlatBillingSubscription | null> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return null;
    }

    const { currentBillingSubscription } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'currentBillingSubscription',
      ]);

    return currentBillingSubscription === NO_BILLING_SUBSCRIPTION
      ? null
      : currentBillingSubscription;
  }
}
