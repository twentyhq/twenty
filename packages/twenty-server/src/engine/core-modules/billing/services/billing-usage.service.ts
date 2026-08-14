/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { formatDateTimeForClickHouse } from 'src/database/clickHouse/clickHouse.util';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { NO_BILLING_SUBSCRIPTION } from 'src/engine/core-modules/billing/constants/no-billing-subscription.constant';
import { type BillingResourceCreditUsageDTO } from 'src/engine/core-modules/billing/dtos/billing-resource-credit-usage.dto';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingCreditGrantService } from 'src/engine/core-modules/billing/services/billing-credit-grant.service';
import { BillingSubscriptionItemService } from 'src/engine/core-modules/billing/services/billing-subscription-item.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingUsageCacheService } from 'src/engine/core-modules/billing/services/billing-usage-cache.service';
import { buildBillingCreditStateLockKey } from 'src/engine/core-modules/billing/utils/build-billing-credit-state-lock-key.util';
import { getBillingSubscriptionPeriod } from 'src/engine/core-modules/billing/utils/get-billing-subscription-period.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import {
  CacheLockException,
  CacheLockExceptionCode,
} from 'src/engine/core-modules/cache-lock/exceptions/cache-lock.exception';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type UsageSumRow = {
  total: string | number | null;
};

type AvailableCreditsParams = {
  workspaceId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
};

type ResolvedAvailableCredits = {
  availableCredits: number;
  isCounterWarm: boolean;
};

export type CreditAvailability =
  | { hasAvailableCredits: true }
  | {
      hasAvailableCredits: false;
      reason: 'workspace-suspended' | 'no-subscription' | 'no-credits';
    };

// This gate runs before every credit-consuming execution, so it waits far less
// than a writer does and falls back to computing unlocked rather than failing
// the execution outright.
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
  ) {}

  async canFeatureBeUsed(workspaceId: string): Promise<boolean> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return true;
    }

    const { currentBillingSubscription } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'currentBillingSubscription',
      ]);

    return (
      currentBillingSubscription !== NO_BILLING_SUBSCRIPTION &&
      currentBillingSubscription.status !== SubscriptionStatus.Canceled
    );
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
      this.billingCreditGrantService.getSpendableCreditsMicro(workspaceId),
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
      this.billingCreditGrantService.getSpendableCreditsMicro(workspaceId),
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

  async decrementAvailableCreditsInCache({
    workspaceId,
    usedCredits,
  }: {
    workspaceId: string;
    usedCredits: number;
  }): Promise<number> {
    const { currentBillingSubscription } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'currentBillingSubscription',
      ]);

    if (currentBillingSubscription === NO_BILLING_SUBSCRIPTION) {
      return 0;
    }

    const { currentPeriodStart, currentPeriodEnd } = currentBillingSubscription;

    const { availableCredits, isCounterWarm } =
      await this.resolveAvailableCredits({
        workspaceId,
        currentPeriodStart,
        currentPeriodEnd,
      });

    // A counter held stale by a recent grant must not be created from a value
    // that may predate it: incrementing an absent key would install
    // -usedCredits as the whole balance. Compute this turn locally instead and
    // let the next read rebuild once the marker lapses.
    return isCounterWarm
      ? await this.billingUsageCacheService.adjustAvailableCredits(
          workspaceId,
          currentPeriodStart,
          -usedCredits,
        )
      : availableCredits - usedCredits;
  }

  // Warming is a read of the ledger followed by a write of what it implies, so
  // a grant landing in between would be counted from the ledger here and then
  // added to the counter again by the grant itself. Taking the writers' lock on
  // the cold path closes that; a hit returns before the lock, keeping the warm
  // path, which is the overwhelming majority of calls, free of Redis round
  // trips.
  private async readWarmAvailableCredits(
    params: AvailableCreditsParams,
  ): Promise<ResolvedAvailableCredits | undefined> {
    const availableCredits =
      await this.billingUsageCacheService.getAvailableCredits(
        params.workspaceId,
        params.currentPeriodStart,
      );

    return isDefined(availableCredits)
      ? { availableCredits, isCounterWarm: true }
      : undefined;
  }

  private async resolveAvailableCredits(
    params: AvailableCreditsParams,
  ): Promise<ResolvedAvailableCredits> {
    const warmAvailableCredits = await this.readWarmAvailableCredits(params);

    if (isDefined(warmAvailableCredits)) {
      return warmAvailableCredits;
    }

    try {
      return await this.cacheLockService.withLock(
        async () =>
          // Another reader may have warmed it while this one waited, so a burst
          // of cold reads pays for ClickHouse once rather than once each.
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

      // Failing the execution because a grant is being written would be worse
      // than answering from a value this call computed itself. Deliberately
      // does not warm: holding the lock is what makes installing a computed
      // value safe, so the counter stays cold until an uncontended read.
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
  ): Promise<ResolvedAvailableCredits> {
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

  async getCreditAvailability(
    workspaceId: string,
  ): Promise<CreditAvailability> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return { hasAvailableCredits: true };
    }

    const workspace = await this.coreEntityCacheService.get(
      'workspaceEntity',
      workspaceId,
    );

    if (
      isDefined(workspace) &&
      workspace.activationStatus === WorkspaceActivationStatus.SUSPENDED
    ) {
      return { hasAvailableCredits: false, reason: 'workspace-suspended' };
    }

    const { currentBillingSubscription } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'currentBillingSubscription',
      ]);

    if (currentBillingSubscription === NO_BILLING_SUBSCRIPTION) {
      return { hasAvailableCredits: false, reason: 'no-subscription' };
    }

    const subscription = currentBillingSubscription;

    const { availableCredits } = await this.resolveAvailableCredits({
      workspaceId: subscription.workspaceId,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
    });

    return availableCredits > 0
      ? { hasAvailableCredits: true }
      : { hasAvailableCredits: false, reason: 'no-credits' };
  }

  async hasAvailableCredits(workspaceId: string): Promise<boolean> {
    const { hasAvailableCredits } =
      await this.getCreditAvailability(workspaceId);

    return hasAvailableCredits;
  }

  async hasAvailableCreditsOrThrow(workspaceId: string): Promise<void> {
    const hasCredits = await this.hasAvailableCredits(workspaceId);

    if (!hasCredits) {
      throw new BillingException(
        'Credits exhausted',
        BillingExceptionCode.BILLING_CREDITS_EXHAUSTED,
      );
    }
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
}
