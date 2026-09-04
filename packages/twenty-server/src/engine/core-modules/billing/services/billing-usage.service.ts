/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { NO_BILLING_SUBSCRIPTION } from 'src/engine/core-modules/billing/constants/no-billing-subscription.constant';
import { SUBSCRIPTION_INACTIVE_REASON_USER_FRIENDLY_MESSAGE } from 'src/engine/core-modules/billing/constants/subscription-inactive-reason-user-friendly-message.constant';
import { type BillingResourceCreditUsageDTO } from 'src/engine/core-modules/billing/dtos/billing-resource-credit-usage.dto';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingCreditGrantService } from 'src/engine/core-modules/billing/services/billing-credit-grant.service';
import { BillingSubscriptionItemService } from 'src/engine/core-modules/billing/services/billing-subscription-item.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingUsageCacheService } from 'src/engine/core-modules/billing/services/billing-usage-cache.service';
import { type CreditAvailability } from 'src/engine/core-modules/billing/types/credit-availability.type';
import { type CurrentBillingSubscription } from 'src/engine/core-modules/billing/types/flat-billing-subscription.type';
import { type SubscriptionInactiveReason } from 'src/engine/core-modules/billing/types/subscription-inactive-reason.type';
import { buildBillingCreditStateLockKey } from 'src/engine/core-modules/billing/utils/build-billing-credit-state-lock-key.util';
import { getBillingSubscriptionPeriod } from 'src/engine/core-modules/billing/utils/get-billing-subscription-period.util';
import { isValidCreditAmountMicro } from 'src/engine/core-modules/usage/utils/is-valid-credit-amount-micro.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import {
  CacheLockException,
  CacheLockExceptionCode,
} from 'src/engine/core-modules/cache-lock/exceptions/cache-lock.exception';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { type QuotaCost } from 'src/engine/core-modules/usage-limit/types/quota-cost.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type UsageSumRow = {
  total: string | number | null;
};

type UsageQuotaScope = {
  workspaceId: string;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  spenders: UsageSpenders;
};

type AvailableCreditsParams = {
  workspaceId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
};

type AvailableCreditsRead = {
  availableCredits: number;
  isCounterWarm: boolean;
};

const AVAILABLE_CREDITS_WARM_UP_LOCK_OPTIONS = {
  ms: 50,
  maxRetries: 20,
  ttl: 10_000,
};

@Injectable()
export class BillingUsageService {
  protected readonly logger = new Logger(BillingUsageService.name);
  constructor(
    private readonly billingCreditGrantService: BillingCreditGrantService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly billingSubscriptionItemService: BillingSubscriptionItemService,
    private readonly billingUsageCacheService: BillingUsageCacheService,
    @InjectWorkspaceScopedRepository(BillingSubscriptionEntity)
    private readonly billingSubscriptionRepository: WorkspaceScopedRepository<BillingSubscriptionEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly clickHouseService: ClickHouseService,
    private readonly cacheLockService: CacheLockService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly usageLimitQuotaService: UsageLimitQuotaService,
  ) {}

  async isAllowanceCounterEnabled(workspaceId: string): Promise<boolean> {
    return this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_QUOTA_ENGINE_CREDIT_BOUND_ENABLED,
      workspaceId,
    );
  }

  private async isAvailableCreditsCounterEnabled(
    workspaceId: string,
  ): Promise<boolean> {
    return (
      this.twentyConfigService.get('IS_BILLING_ENABLED') &&
      !(await this.isAllowanceCounterEnabled(workspaceId))
    );
  }

  async assertUsageAllowed({
    workspaceId,
    resourceType,
    operationType,
    spenders,
  }: UsageQuotaScope): Promise<void> {
    await this.assertSubscriptionActive(workspaceId);

    if (await this.isAvailableCreditsCounterEnabled(workspaceId)) {
      await this.assertAvailableCreditsNotExhausted(workspaceId);
    }

    await this.usageLimitQuotaService.assertQuotaNotExhausted({
      workspaceId,
      resourceType,
      operationType,
      spenders,
    });
  }

  async consumeUsageQuota({
    workspaceId,
    resourceType,
    operationType,
    spenders,
    cost,
  }: UsageQuotaScope & { cost: QuotaCost }): Promise<{
    hasNoMoreAvailableCredits: boolean;
  }> {
    const { exhausted } = await this.usageLimitQuotaService.consumeQuota({
      workspaceId,
      resourceType,
      operationType,
      spenders,
      cost,
    });

    const isAllowanceExhausted = exhausted?.exhaustedKind === 'allowance';

    if (!(await this.isAvailableCreditsCounterEnabled(workspaceId))) {
      return { hasNoMoreAvailableCredits: isAllowanceExhausted };
    }

    const availableCredits = await this.decrementAvailableCreditsInCache({
      workspaceId,
      usedCredits: cost.creditsUsedMicro,
    });

    return {
      hasNoMoreAvailableCredits: isAllowanceExhausted || availableCredits <= 0,
    };
  }

  async getSubscriptionInactiveReason(
    workspaceId: string,
  ): Promise<SubscriptionInactiveReason | null> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return null;
    }

    const workspace = await this.coreEntityCacheService.get(
      'workspaceEntity',
      workspaceId,
    );

    if (
      isDefined(workspace) &&
      workspace.activationStatus === WorkspaceActivationStatus.SUSPENDED
    ) {
      return 'WORKSPACE_SUSPENDED';
    }

    const currentBillingSubscription =
      await this.getCachedCurrentBillingSubscription(workspaceId);

    if (currentBillingSubscription === NO_BILLING_SUBSCRIPTION) {
      return 'NO_SUBSCRIPTION';
    }

    return null;
  }

  async assertSubscriptionActive(workspaceId: string): Promise<void> {
    const subscriptionInactiveReason =
      await this.getSubscriptionInactiveReason(workspaceId);

    if (isDefined(subscriptionInactiveReason)) {
      throw new BillingException(
        `Workspace ${workspaceId} has no active subscription: ${subscriptionInactiveReason}`,
        BillingExceptionCode.BILLING_SUBSCRIPTION_INACTIVE,
        {
          userFriendlyMessage:
            SUBSCRIPTION_INACTIVE_REASON_USER_FRIENDLY_MESSAGE[
              subscriptionInactiveReason
            ],
        },
      );
    }
  }

  async getCreditAvailability(
    workspaceId: string,
  ): Promise<CreditAvailability> {
    const subscriptionInactiveReason =
      await this.getSubscriptionInactiveReason(workspaceId);

    if (isDefined(subscriptionInactiveReason)) {
      return { hasAvailableCredits: false, reason: subscriptionInactiveReason };
    }

    const remainingMicro = (await this.isAllowanceCounterEnabled(workspaceId))
      ? await this.usageLimitQuotaService.getAllowanceRemainingMicro(
          workspaceId,
        )
      : await this.getAvailableCreditsOrNull(workspaceId);

    if (isDefined(remainingMicro) && remainingMicro <= 0) {
      return { hasAvailableCredits: false, reason: 'NO_CREDITS' };
    }

    return { hasAvailableCredits: true };
  }

  async hasAvailableCredits(workspaceId: string): Promise<boolean> {
    const { hasAvailableCredits } =
      await this.getCreditAvailability(workspaceId);

    return hasAvailableCredits;
  }

  async getResourceCreditProductUsage(
    workspace: WorkspaceEntity,
  ): Promise<BillingResourceCreditUsageDTO[]> {
    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        { workspaceId: workspace.id },
      );

    const resourceCreditItemDetail =
      await this.billingSubscriptionItemService.getResourceCreditSubscriptionItemDetails(
        subscription,
      );

    if (!isDefined(resourceCreditItemDetail)) {
      throw new BillingException(
        `Resource credit item not found for workspace ${workspace.id}`,
        BillingExceptionCode.BILLING_SUBSCRIPTION_ITEM_NOT_FOUND,
      );
    }

    const { periodStart, periodEnd } =
      getBillingSubscriptionPeriod(subscription);

    return [
      await this.buildResourceCreditUsage(
        workspace.id,
        subscription,
        resourceCreditItemDetail,
        periodStart,
        periodEnd,
      ),
    ];
  }

  private async buildResourceCreditUsage(
    workspaceId: string,
    subscription: BillingSubscriptionEntity,
    item: NonNullable<
      Awaited<
        ReturnType<
          typeof this.billingSubscriptionItemService.getResourceCreditSubscriptionItemDetails
        >
      >
    >,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<BillingResourceCreditUsageDTO> {
    const [usedCredits, rolloverCredits] = await Promise.all([
      this.getCurrentPeriodCreditsUsed(workspaceId, periodStart),
      this.billingCreditGrantService.getActiveCreditsMicro(workspaceId),
    ]);

    const grantedCredits =
      subscription.status === SubscriptionStatus.Trialing
        ? item.freeTrialQuantity
        : item.creditAmount;

    return {
      productKey: item.productKey,
      periodStart,
      periodEnd,
      usedCredits,
      grantedCredits,
      rolloverCredits,
      totalGrantedCredits: grantedCredits + rolloverCredits,
      unitPriceCents: item.unitPriceCents,
    };
  }

  private async getAvailableCreditsFromClickHouse({
    workspaceId,
    currentPeriodStart,
  }: {
    workspaceId: string;
    currentPeriodStart: Date | string;
  }): Promise<number> {
    const subscription = await this.billingSubscriptionRepository.findOne(
      workspaceId,
      {
        where: { currentPeriodStart: new Date(currentPeriodStart) },
        relations: [
          'billingSubscriptionItems',
          'billingSubscriptionItems.billingProduct',
          'billingSubscriptionItems.billingProduct.billingPrices',
        ],
      },
    );

    if (!isDefined(subscription)) {
      throw new BillingException(
        `Subscription not found for workspace ${workspaceId}`,
        BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_FOUND,
      );
    }

    const resourceUsageCap = this.getResourceUsageCap(subscription);

    const [creditBalance, usage] = await Promise.all([
      this.billingCreditGrantService.getActiveCreditsMicro(workspaceId),
      this.getCurrentPeriodCreditsUsed(
        subscription.workspaceId,
        subscription.currentPeriodStart,
      ),
    ]);

    return resourceUsageCap + creditBalance - usage;
  }

  getTrialResourceUsageCap(subscription: BillingSubscriptionEntity): number {
    return this.billingSubscriptionService.getTrialPeriodFreeWorkflowCredits(
      subscription,
    );
  }

  getResourceUsageCap(subscription: BillingSubscriptionEntity): number {
    const isInFreeTrial = subscription.status === SubscriptionStatus.Trialing;

    if (isInFreeTrial) {
      return this.getTrialResourceUsageCap(subscription);
    }

    const resourceCreditItem = subscription.billingSubscriptionItems.find(
      (item) =>
        item.billingProduct.metadata?.productKey ===
        BillingProductKey.RESOURCE_CREDIT,
    );

    const resourceCreditPrice =
      resourceCreditItem?.billingProduct.billingPrices.find(
        (price) => price.stripePriceId === resourceCreditItem.stripePriceId,
      );

    if (!isDefined(resourceCreditPrice)) {
      throw new BillingException(
        `Resource credit price not found for workspace ${subscription.workspaceId}`,
        BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
      );
    }

    return Number(resourceCreditPrice.metadata?.credit_amount ?? 0);
  }

  private async assertAvailableCreditsNotExhausted(
    workspaceId: string,
  ): Promise<void> {
    const availableCredits = await this.getAvailableCreditsOrNull(workspaceId);

    if (isDefined(availableCredits) && availableCredits <= 0) {
      throw new BillingException(
        'Credits exhausted',
        BillingExceptionCode.BILLING_CREDITS_EXHAUSTED,
      );
    }
  }

  private async getAvailableCreditsOrNull(
    workspaceId: string,
  ): Promise<number | null> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return null;
    }

    const currentBillingSubscription =
      await this.getCachedCurrentBillingSubscription(workspaceId);

    if (currentBillingSubscription === NO_BILLING_SUBSCRIPTION) {
      return null;
    }

    const { availableCredits } = await this.getOrWarmAvailableCredits({
      workspaceId: currentBillingSubscription.workspaceId,
      currentPeriodStart: currentBillingSubscription.currentPeriodStart,
      currentPeriodEnd: currentBillingSubscription.currentPeriodEnd,
    });

    return availableCredits;
  }

  private async decrementAvailableCreditsInCache({
    workspaceId,
    usedCredits,
  }: {
    workspaceId: string;
    usedCredits: number;
  }): Promise<number> {
    const creditsToDecrement = isValidCreditAmountMicro(usedCredits)
      ? usedCredits
      : 0;

    if (creditsToDecrement !== usedCredits) {
      this.logger.error(
        `Refusing to decrement ${usedCredits} credits for workspace ${workspaceId}; treating as 0`,
      );
    }

    const currentBillingSubscription =
      await this.getCachedCurrentBillingSubscription(workspaceId);

    if (currentBillingSubscription === NO_BILLING_SUBSCRIPTION) {
      return 0;
    }

    const { currentPeriodStart, currentPeriodEnd } = currentBillingSubscription;

    const { availableCredits, isCounterWarm } =
      await this.getOrWarmAvailableCredits({
        workspaceId,
        currentPeriodStart,
        currentPeriodEnd,
      });

    return isCounterWarm
      ? await this.billingUsageCacheService.adjustAvailableCredits(
          workspaceId,
          currentPeriodStart,
          -creditsToDecrement,
        )
      : availableCredits - creditsToDecrement;
  }

  private async readWarmAvailableCredits(
    params: AvailableCreditsParams,
  ): Promise<AvailableCreditsRead | undefined> {
    const availableCredits =
      await this.billingUsageCacheService.getAvailableCredits(
        params.workspaceId,
        params.currentPeriodStart,
      );

    return isDefined(availableCredits)
      ? { availableCredits, isCounterWarm: true }
      : undefined;
  }

  private async getOrWarmAvailableCredits(
    params: AvailableCreditsParams,
  ): Promise<AvailableCreditsRead> {
    const warmAvailableCredits = await this.readWarmAvailableCredits(params);

    if (isDefined(warmAvailableCredits)) {
      return warmAvailableCredits;
    }

    try {
      return await this.cacheLockService.withLock(
        async () =>
          (await this.readWarmAvailableCredits(params)) ??
          (await this.computeAndWarmAvailableCredits(params)),
        buildBillingCreditStateLockKey(params.workspaceId),
        AVAILABLE_CREDITS_WARM_UP_LOCK_OPTIONS,
      );
    } catch (error) {
      if (
        !(error instanceof CacheLockException) ||
        error.code !== CacheLockExceptionCode.LOCK_ACQUISITION_TIMEOUT
      ) {
        throw error;
      }

      this.logger.warn(
        `Computing available credits for workspace ${params.workspaceId} without the credit state lock: ${error.message}`,
      );

      return {
        availableCredits: await this.getAvailableCreditsFromClickHouse(params),
        isCounterWarm: false,
      };
    }
  }

  private async computeAndWarmAvailableCredits(
    params: AvailableCreditsParams,
  ): Promise<AvailableCreditsRead> {
    const availableCredits =
      await this.getAvailableCreditsFromClickHouse(params);

    await this.billingUsageCacheService.warmAvailableCredits(
      params.workspaceId,
      params.currentPeriodStart,
      params.currentPeriodEnd,
      availableCredits,
    );

    return { availableCredits, isCounterWarm: true };
  }

  // Returns null when usage could not be read. ClickHouseService.select
  // swallows query errors and returns [], but a bare sum() aggregate always
  // yields exactly one row, so an empty result means the read failed rather
  // than "nothing was used". Callers that hand out credits must not confuse
  // the two.
  private async sumCreditsUsedMicroOrNull(
    condition: string,
    params: Record<string, unknown>,
  ): Promise<number | null> {
    const rows = await this.clickHouseService.select<UsageSumRow>(
      `SELECT sum(creditsUsedMicro) AS total
       FROM usageEvent
       WHERE workspaceId = {workspaceId:String}
         AND ${condition}`,
      params,
    );

    if (rows.length === 0) {
      return null;
    }

    const rawTotal = rows[0]?.total ?? 0;
    const total = typeof rawTotal === 'string' ? Number(rawTotal) : rawTotal;

    return Number.isFinite(total) ? total : 0;
  }

  // Sums by event timestamp rather than by the stamped periodStart dimension.
  // At a period transition the subscription's currentPeriodStart has already
  // moved on, so an equality match on periodStart would read the new period
  // and report a period that has barely started as unused.
  async getCreditsUsedBetweenOrNull({
    workspaceId,
    from,
    to,
  }: {
    workspaceId: string;
    from: Date;
    to: Date;
  }): Promise<number | null> {
    return this.sumCreditsUsedMicroOrNull(
      'timestamp >= {from:DateTime64(3)} AND timestamp < {to:DateTime64(3)}',
      {
        workspaceId,
        from: formatDateTimeForClickHouse(from),
        to: formatDateTimeForClickHouse(to),
      },
    );
  }

  // Fails open: an unreadable usage total must never block a paying workspace.
  async getCurrentPeriodCreditsUsed(
    workspaceId: string,
    periodStart: Date,
  ): Promise<number> {
    const usedMicro = await this.sumCreditsUsedMicroOrNull(
      'periodStart = {periodStart:DateTime64(3)}',
      {
        workspaceId,
        periodStart: formatDateTimeForClickHouse(periodStart),
      },
    );

    return usedMicro ?? 0;
  }

  async getCachedCurrentBillingSubscription(
    workspaceId: string,
  ): Promise<CurrentBillingSubscription> {
    const { currentBillingSubscription } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'currentBillingSubscription',
      ]);

    return currentBillingSubscription;
  }
}
