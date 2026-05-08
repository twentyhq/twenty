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
import { type BillingMeteredProductUsageDTO } from 'src/engine/core-modules/billing/dtos/billing-metered-product-usage.dto';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingSubscriptionItemService } from 'src/engine/core-modules/billing/services/billing-subscription-item.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingUsageCapService } from 'src/engine/core-modules/billing/services/billing-usage-cap.service';
import { MeteredCreditService } from 'src/engine/core-modules/billing/services/metered-credit.service';
import { StripeBillingMeterEventService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-meter-event.service';
import { StripeCreditGrantService } from 'src/engine/core-modules/billing/stripe/services/stripe-credit-grant.service';
import { buildBillingUsageAvailableCreditsCacheKey } from 'src/engine/core-modules/billing/utils/build-billing-usage-available-credits-cache-key.util';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type UsageEvent } from 'src/engine/core-modules/usage/types/usage-event.type';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { FeatureFlagKey } from 'twenty-shared/types';

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
    private readonly stripeBillingMeterEventService: StripeBillingMeterEventService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly billingSubscriptionItemService: BillingSubscriptionItemService,
    private readonly stripeCreditGrantService: StripeCreditGrantService,
    @InjectCacheStorage(CacheStorageNamespace.EngineBillingUsage)
    private readonly billingUsageCacheStorage: CacheStorageService,
    @InjectRepository(BillingSubscriptionEntity)
    private readonly billingSubscriptionRepository: Repository<BillingSubscriptionEntity>,
    private readonly meteredCreditService: MeteredCreditService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly clickHouseService: ClickHouseService,
    private readonly billingUsageCapService: BillingUsageCapService,
    private readonly featureFlagService: FeatureFlagService,
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

  //TODO: TO be deprecated
  async billUsage({
    workspaceId,
    usageEvents,
  }: {
    workspaceId: string;
    usageEvents: UsageEvent[];
  }) {
    const workspaceStripeCustomer =
      await this.billingCustomerRepository.findOne({
        where: {
          workspaceId,
        },
      });

    if (!workspaceStripeCustomer) {
      throw new BillingException(
        'Stripe customer not found',
        BillingExceptionCode.BILLING_CUSTOMER_NOT_FOUND,
      );
    }

    try {
      await Promise.all(
        usageEvents.map((usageEvent) =>
          this.stripeBillingMeterEventService.sendBillingMeterEvent({
            usageEvent,
            stripeCustomerId: workspaceStripeCustomer.stripeCustomerId,
          }),
        ),
      );
    } catch (error) {
      throw new BillingException(
        `Failed to send billing meter events to Stripe: ${error}`,
        BillingExceptionCode.BILLING_METER_EVENT_FAILED,
      );
    }
  }

  //TODO: TO be deprecated
  async getMeteredProductsUsage(
    workspace: WorkspaceEntity,
  ): Promise<BillingMeteredProductUsageDTO[]> {
    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        { workspaceId: workspace.id },
      );

    const meteredSubscriptionItemDetails =
      await this.billingSubscriptionItemService.getMeteredSubscriptionItemDetails(
        subscription.id,
      );

    const { periodStart, periodEnd } = this.getSubscriptionPeriod(subscription);

    return Promise.all(
      meteredSubscriptionItemDetails.map((item) =>
        this.buildMeteredProductUsage(
          subscription,
          item,
          periodStart,
          periodEnd,
        ),
      ),
    );
  }

  async getResourceCreditProductUsage(
    workspace: WorkspaceEntity,
  ): Promise<BillingMeteredProductUsageDTO[]> {
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
  ): Promise<BillingMeteredProductUsageDTO> {
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

  //TODO: TO be deprecated
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

  //TODO: TO be deprecated
  private async buildMeteredProductUsage(
    subscription: BillingSubscriptionEntity,
    item: Awaited<
      ReturnType<
        typeof this.billingSubscriptionItemService.getMeteredSubscriptionItemDetails
      >
    >[number],
    periodStart: Date,
    periodEnd: Date,
  ): Promise<BillingMeteredProductUsageDTO> {
    const meterEventsSum =
      await this.stripeBillingMeterEventService.sumMeterEvents(
        item.stripeMeterId,
        subscription.stripeCustomerId,
        periodStart,
        periodEnd,
      );

    const grantedCredits =
      subscription.status === SubscriptionStatus.Trialing
        ? item.freeTrialQuantity
        : item.tierQuantity;

    const rolloverCredits =
      await this.stripeCreditGrantService.getCustomerCreditBalance(
        subscription.stripeCustomerId,
        item.unitPriceCents,
      );

    return {
      productKey: item.productKey,
      periodStart,
      periodEnd,
      usedCredits: meterEventsSum,
      grantedCredits,
      rolloverCredits,
      totalGrantedCredits: grantedCredits + rolloverCredits,
      unitPriceCents: item.unitPriceCents,
    };
  }

  async flushAvailableCreditsFromCache(workspaceId: string): Promise<void> {
    await this.billingUsageCacheStorage.flushByPattern(
      `available-credits:${workspaceId}:*`,
    );
  }

  private async warmAvailableCredits(
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

    const isV2 = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_BILLING_V2_ENABLED,
      workspaceId,
    );

    if (isV2) {
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
    } else {
      const meteredPricingInfo =
        this.meteredCreditService.extractMeteredPricingInfoFromSubscription(
          subscription,
        );

      if (!meteredPricingInfo) {
        throw new BillingException(
          `No metered item found for workspace ${workspaceId}`,
          BillingExceptionCode.BILLING_SUBSCRIPTION_ITEM_NOT_FOUND,
        );
      }

      const [creditBalance, usage] = await Promise.all([
        this.meteredCreditService.getCreditBalance(
          subscription.stripeCustomerId,
          meteredPricingInfo.unitPriceCents,
        ),
        this.getCurrentPeriodCreditsUsed(
          subscription.workspaceId,
          subscription.currentPeriodStart,
        ),
      ]);
      return meteredPricingInfo.tierCap + creditBalance - usage;
    }
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

  async decrementAvailableCredits({
    workspaceId,
    usedCredits,
  }: {
    workspaceId: string;
    usedCredits: number;
  }): Promise<void> {
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
      await this.warmAvailableCredits(
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
  }

  async invalidateAvailableCredits(
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

    await this.warmAvailableCredits(
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
