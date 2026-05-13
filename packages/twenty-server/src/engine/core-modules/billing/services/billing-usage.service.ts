/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import { differenceInDays } from 'date-fns';
import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { formatDateTimeForClickHouse } from 'src/database/clickHouse/clickHouse.util';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { type BillingResourceCreditUsageDTO } from 'src/engine/core-modules/billing/dtos/billing-resource-credit-usage.dto';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingSubscriptionItemService } from 'src/engine/core-modules/billing/services/billing-subscription-item.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingUsageCapService } from 'src/engine/core-modules/billing/services/billing-usage-cap.service';
import { buildBillingUsageAvailableCreditsCacheKey } from 'src/engine/core-modules/billing/utils/build-billing-usage-available-credits-cache-key.util';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type UsageSumRow = {
  total: string | number | null;
};

@Injectable()
export class BillingUsageService {
  protected readonly logger = new Logger(BillingUsageService.name);
  constructor(
    @InjectRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: Repository<BillingCustomerEntity>,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly billingSubscriptionItemService: BillingSubscriptionItemService,
    @InjectCacheStorage(CacheStorageNamespace.EngineBillingUsage)
    private readonly billingUsageCacheStorage: CacheStorageService,
    @InjectRepository(BillingSubscriptionEntity)
    private readonly billingSubscriptionRepository: Repository<BillingSubscriptionEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly clickHouseService: ClickHouseService,
    private readonly billingUsageCapService: BillingUsageCapService,
  ) {}

  async canFeatureBeUsed(workspaceId: string): Promise<boolean> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return true;
    }

    const billingSubscription =
      await this.billingSubscriptionService.getCurrentBillingSubscription({
        workspaceId,
      });

    return !!billingSubscription;
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

    const { periodStart, periodEnd } = this.getSubscriptionPeriod(subscription);

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
    const usedCredits = await this.getCurrentPeriodCreditsUsed(
      workspaceId,
      periodStart,
    );

    const grantedCredits =
      subscription.status === SubscriptionStatus.Trialing
        ? item.freeTrialQuantity
        : item.creditAmount;

    const billingCustomer = await this.billingCustomerRepository.findOne({
      where: { workspaceId },
    });
    const rolloverCredits = billingCustomer?.creditBalanceMicro ?? 0;

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

  private getSubscriptionPeriod(subscription: BillingSubscriptionEntity): {
    periodStart: Date;
    periodEnd: Date;
  } {
    const isTrialing =
      subscription.status === SubscriptionStatus.Trialing &&
      isDefined(subscription.trialStart) &&
      isDefined(subscription.trialEnd);

    if (isTrialing) {
      return {
        periodStart: subscription.trialStart!,
        periodEnd: subscription.trialEnd!,
      };
    }

    return {
      periodStart: subscription.currentPeriodStart,
      periodEnd: subscription.currentPeriodEnd,
    };
  }

  async flushAvailableCreditsFromCache(workspaceId: string): Promise<void> {
    await this.billingUsageCacheStorage.flushByPattern(
      `available-credits:${workspaceId}:*`,
    );
  }

  private async warmAvailableCreditsInCache(
    workspaceId: string,
    periodStart: Date | string,
    periodEnd: Date | string,
    availableCredits: number,
  ): Promise<void> {
    const ttlMs = Math.max(new Date(periodEnd).getTime() - Date.now(), 0);

    await this.billingUsageCacheStorage.set(
      buildBillingUsageAvailableCreditsCacheKey(workspaceId, periodStart),
      availableCredits,
      ttlMs,
    );
  }

  private async getAvailableCreditsFromCache(
    workspaceId: string,
    periodStart: Date | string,
  ): Promise<number | undefined> {
    return this.billingUsageCacheStorage.get<number>(
      buildBillingUsageAvailableCreditsCacheKey(workspaceId, periodStart),
    );
  }

  private async getAvailableCreditsFromClickHouse({
    workspaceId,
    currentPeriodStart,
  }: {
    workspaceId: string;
    currentPeriodStart: Date | string;
  }): Promise<number> {
    const subscription = await this.billingSubscriptionRepository.findOne({
      where: { workspaceId, currentPeriodStart: new Date(currentPeriodStart) },
      relations: [
        'billingSubscriptionItems',
        'billingSubscriptionItems.billingProduct',
        'billingSubscriptionItems.billingProduct.billingPrices',
      ],
    });

    if (!isDefined(subscription)) {
      throw new BillingException(
        `Subscription not found for workspace ${workspaceId}`,
        BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_FOUND,
      );
    }

    const resourceUsageCap = this.getResourceUsageCap(subscription);

    const { creditBalanceMicro: creditBalance } =
      await this.billingCustomerRepository.findOneOrFail({
        select: { creditBalanceMicro: true },
        where: { workspaceId },
      });

    const usage = await this.getCurrentPeriodCreditsUsed(
      subscription.workspaceId,
      subscription.currentPeriodStart,
    );

    return resourceUsageCap + creditBalance - usage;
  }

  getResourceUsageCap(subscription: BillingSubscriptionEntity): number {
    const isInFreeTrial = subscription.status === SubscriptionStatus.Trialing;

    if (isInFreeTrial) {
      const trialDuration =
        isDefined(subscription.trialEnd) && isDefined(subscription.trialStart)
          ? differenceInDays(subscription.trialEnd, subscription.trialStart)
          : 0;

      const trialWithCreditCardDuration = this.twentyConfigService.get(
        'BILLING_FREE_TRIAL_WITH_CREDIT_CARD_DURATION_IN_DAYS',
      );

      return trialDuration === trialWithCreditCardDuration
        ? this.twentyConfigService.get(
            'BILLING_FREE_WORKFLOW_CREDITS_FOR_TRIAL_PERIOD_WITH_CREDIT_CARD',
          )
        : this.twentyConfigService.get(
            'BILLING_FREE_WORKFLOW_CREDITS_FOR_TRIAL_PERIOD_WITHOUT_CREDIT_CARD',
          );
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
    const {
      billingSubscription: { currentPeriodStart, currentPeriodEnd },
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'billingSubscription',
    ]);

    const cachedAvailableCredits = await this.getAvailableCreditsFromCache(
      workspaceId,
      currentPeriodStart,
    );

    const availableCredits = isDefined(cachedAvailableCredits)
      ? cachedAvailableCredits
      : await this.getAvailableCreditsFromClickHouse({
          workspaceId,
          currentPeriodStart,
        });

    if (!isDefined(cachedAvailableCredits)) {
      await this.warmAvailableCreditsInCache(
        workspaceId,
        currentPeriodStart,
        currentPeriodEnd,
        availableCredits,
      );
    }

    const decrementedAvailableCredits =
      await this.billingUsageCacheStorage.incrBy(
        buildBillingUsageAvailableCreditsCacheKey(
          workspaceId,
          currentPeriodStart,
        ),
        -usedCredits,
      );

    if (decrementedAvailableCredits <= 0) {
      await this.billingUsageCapService.setSubscriptionItemHasReachedCap(
        workspaceId,
        true,
      );
    }

    return decrementedAvailableCredits;
  }

  async invalidateAvailableCreditsInCache(
    workspaceId: string,
    periodStart: Date,
  ): Promise<void> {
    await this.billingUsageCacheStorage.del(
      buildBillingUsageAvailableCreditsCacheKey(workspaceId, periodStart),
    );
  }

  async hasAvailableCredits(workspaceId: string): Promise<boolean> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return true;
    }

    const { billingSubscription: subscription } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'billingSubscription',
      ]);
    const cached = await this.getAvailableCreditsFromCache(
      subscription.workspaceId,
      subscription.currentPeriodStart,
    );

    if (isDefined(cached)) {
      return cached > 0;
    }

    const availableCredits = await this.getAvailableCreditsFromClickHouse({
      workspaceId: subscription.workspaceId,
      currentPeriodStart: subscription.currentPeriodStart,
    });

    await this.warmAvailableCreditsInCache(
      subscription.workspaceId,
      subscription.currentPeriodStart,
      subscription.currentPeriodEnd,
      availableCredits,
    );

    return availableCredits > 0;
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

  async getCurrentPeriodCreditsUsed(
    workspaceId: string,
    periodStart: Date,
  ): Promise<number> {
    const query = `
      SELECT sum(creditsUsedMicro) AS total
      FROM usageEvent
      WHERE workspaceId = {workspaceId:String}
        AND periodStart = {periodStart:DateTime64(3)}
    `;

    const rows = await this.clickHouseService.select<UsageSumRow>(query, {
      workspaceId,
      periodStart: formatDateTimeForClickHouse(periodStart),
    });

    const rawTotal = rows[0]?.total ?? 0;
    const total = typeof rawTotal === 'string' ? Number(rawTotal) : rawTotal;

    return Number.isFinite(total) ? total : 0;
  }
}
