import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { JsonContains, Repository } from 'typeorm';
import Stripe from 'stripe';
import { isDefined } from 'twenty-shared/utils';

import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { billingValidator } from 'src/engine/core-modules/billing/billing.validate';
import { StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { findOrThrow } from 'src/utils/find-or-throw.util';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SubscriptionWithSchedule } from 'src/engine/core-modules/billing/types/billing-subscription-with-schedule.type';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { getPlanKeyFromSubscription } from 'src/engine/core-modules/billing/utils/get-plan-key-from-subscription.util';
import { BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';

@Injectable()
export class BillingSubscriptionItemService {
  constructor(
    @InjectRepository(BillingSubscriptionItem)
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItem>,
    @InjectRepository(BillingPrice)
    private readonly billingPriceRepository: Repository<BillingPrice>,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingPlanService: BillingPlanService,
    private readonly stripeSubscriptionService: StripeSubscriptionService,
    private readonly stripeSubscriptionScheduleService: StripeSubscriptionScheduleService,
  ) {}

  async setMeteredSubscriptionPrice(
    subscriptionId: string,
    newPriceId: string,
  ) {
    const subscriptionItem =
      await this.billingSubscriptionItemRepository.findOne({
        where: {
          billingSubscriptionId: subscriptionId,
          billingProduct: {
            metadata: JsonContains({
              priceUsageBased: BillingUsageType.METERED,
            }),
          },
        },
        relations: [
          'billingProduct',
          'billingProduct.billingPrices',
          'billingSubscription',
        ],
      });

    if (!subscriptionItem) {
      throw new BillingException(
        `Cannot find subscription item for subscription ${subscriptionId}`,
        BillingExceptionCode.BILLING_SUBSCRIPTION_ITEM_NOT_FOUND,
      );
    }

    const currentBillingMeteredPrice = subscriptionItem
      ? this.findMatchingPrice(subscriptionItem)
      : null;

    if (!currentBillingMeteredPrice) {
      throw new BillingException(
        `Cannot find price for product ${subscriptionItem.stripeProductId}`,
        BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
      );
    }

    const newMeteredPrice = await this.billingPriceRepository.findOne({
      where: { stripePriceId: newPriceId },
      relations: ['billingProduct'],
    });

    if (!newMeteredPrice) {
      throw new BillingException(
        `Cannot find price with id ${newPriceId}`,
        BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
        { userFriendlyMessage: 'Price not found' },
      );
    }

    billingValidator.assertIsMeteredPrice(newMeteredPrice);

    if (
      !this.isFirstPriceTiersLowerThatSecondPriceTier(
        currentBillingMeteredPrice,
        newMeteredPrice,
      )
    ) {
      return this.schedulePriceMeteredUpdate(subscriptionItem, newMeteredPrice);
    }

    await this.stripeSubscriptionService.updateSubscriptionItems(
      subscriptionItem.stripeSubscriptionId,
      [
        {
          ...subscriptionItem,
          stripePriceId: newPriceId,
        },
      ],
    );
  }

  private generateNextPhase(
    currentLicensedItem: Stripe.SubscriptionSchedule.Phase.Item,
    newPrice: BillingPrice,
    subscription: SubscriptionWithSchedule,
    subscriptionItem: BillingSubscriptionItem,
  ) {
    return {
      items: [
        {
          price:
            typeof currentLicensedItem.price === 'string'
              ? currentLicensedItem.price
              : currentLicensedItem.price.id,
          quantity: currentLicensedItem.quantity,
        },
        { price: newPrice.stripePriceId },
      ],
      start_date: subscription.current_period_end,
      billing_thresholds:
        this.stripeSubscriptionService.getBillingThresholdsByInterval(
          subscriptionItem.billingSubscription.interval,
        ),
      proration_behavior: 'none' as const,
    };
  }

  private async getPayloadToUpdateExistingPhase(
    existingItemsPhases: Array<Stripe.SubscriptionSchedule.Phase>,
    newPrice: BillingPrice,
    subscription: SubscriptionWithSchedule,
    subscriptionItem: BillingSubscriptionItem,
  ) {
    const pricesPerPlanResult =
      await this.billingPlanService.getPricesPerPlanByInterval({
        planKey: getPlanKeyFromSubscription(
          subscriptionItem.billingSubscription,
        ),
        interval: SubscriptionInterval.Month,
      });

    const { tiers: currentMeteredBillingPriceTiers } =
      await this.billingPriceRepository.findOneByOrFail({
        stripePriceId: subscriptionItem.stripePriceId,
      });

    billingValidator.assertIsMeteredTiersSchemaOrThrow(
      currentMeteredBillingPriceTiers,
    );

    const targetMeteredPrice =
      await this.billingSubscriptionService.findMeteredMatchingPriceForIntervalSwitching(
        {
          billingPricesPerPlanAndIntervalArray:
            pricesPerPlanResult.meteredProductsPrices,
          meteredPriceId: newPrice.stripePriceId,
        },
      );

    const nextPhaseLicenseItem = findOrThrow(
      existingItemsPhases[1].items,
      (item) => isDefined(item.quantity),
    );

    return {
      start_date: subscription.schedule.phases[1].start_date,
      billing_thresholds:
        this.stripeSubscriptionService.getBillingThresholdsByInterval(
          SubscriptionInterval.Month,
        ),
      items: [
        {
          price:
            typeof nextPhaseLicenseItem.price === 'string'
              ? nextPhaseLicenseItem.price
              : nextPhaseLicenseItem.price.id,
          quantity: nextPhaseLicenseItem.quantity,
        },
        { price: targetMeteredPrice.stripePriceId },
      ],
    };
  }

  private async schedulePriceMeteredUpdate(
    subscriptionItem: BillingSubscriptionItem,
    newPrice: BillingPrice,
  ) {
    const subscription =
      await this.stripeSubscriptionScheduleService.getSubscriptionWithSchedule(
        subscriptionItem.stripeSubscriptionId,
      );

    const currentLicensedItem = findOrThrow(
      subscription.schedule.phases[0].items,
      (item) => item.price !== subscriptionItem.stripePriceId,
    );

    const secondPhase =
      subscription.schedule.phases.length === 1
        ? this.generateNextPhase(
            currentLicensedItem,
            newPrice,
            subscription,
            subscriptionItem,
          )
        : await this.getPayloadToUpdateExistingPhase(
            subscription.schedule.phases,
            newPrice,
            subscription,
            subscriptionItem,
          );

    return await this.stripeSubscriptionScheduleService.updateSchedule(
      subscription.schedule.id,
      {
        phases: [
          {
            start_date: subscription.schedule.phases[0].start_date,
            end_date: subscription.schedule.phases[0].end_date,
            items: subscription.schedule.phases[0].items.map((it) => ({
              price: typeof it.price === 'string' ? it.price : it.price!.id,
              quantity: it.quantity ?? undefined,
            })),
          },
          secondPhase,
        ],
      },
    );
  }

  async getMeteredSubscriptionItemDetails(subscriptionId: string) {
    const meteredSubscriptionItems =
      await this.billingSubscriptionItemRepository.find({
        where: {
          billingSubscriptionId: subscriptionId,
        },
        relations: ['billingProduct', 'billingProduct.billingPrices'],
      });

    return meteredSubscriptionItems.reduce(
      (acc, item) => {
        const price = this.findMatchingPrice(item);

        if (!price.stripeMeterId) {
          return acc;
        }

        return acc.concat({
          stripeSubscriptionItemId: item.stripeSubscriptionItemId,
          productKey: item.billingProduct.metadata.productKey,
          stripeMeterId: price.stripeMeterId,
          tierQuantity: this.getTierQuantity(price),
          freeTrialQuantity: this.getFreeTrialQuantity(item),
          unitPriceCents: this.getUnitPrice(price),
        });
      },
      [] as Array<{
        stripeSubscriptionItemId: string;
        productKey: BillingProductKey;
        stripeMeterId: string;
        tierQuantity: number;
        freeTrialQuantity: number;
        unitPriceCents: number;
      }>,
    );
  }

  private isFirstPriceTiersLowerThatSecondPriceTier(
    price1: BillingPrice,
    price2: BillingPrice,
  ) {
    billingValidator.assertIsMeteredTiersSchemaOrThrow(price1.tiers);
    billingValidator.assertIsMeteredTiersSchemaOrThrow(price2.tiers);

    return price1.tiers[0].up_to < price2.tiers[0].up_to;
  }

  private findMatchingPrice(item: BillingSubscriptionItem): BillingPrice {
    const matchingPrice = item.billingProduct.billingPrices.find(
      (price) => price.stripePriceId === item.stripePriceId,
    );

    if (!matchingPrice) {
      throw new BillingException(
        `Cannot find price for product ${item.stripeProductId}`,
        BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
      );
    }

    return matchingPrice;
  }

  private getTierQuantity(price: BillingPrice): number {
    billingValidator.assertIsMeteredTiersSchemaOrThrow(price.tiers);

    return price.tiers[0].up_to;
  }

  private getFreeTrialQuantity(item: BillingSubscriptionItem): number {
    switch (item.billingProduct.metadata.productKey) {
      case BillingProductKey.WORKFLOW_NODE_EXECUTION:
        return (
          // item.metadata.trialPeriodFreeWorkflowCredits ||
          this.twentyConfigService.get(
            'BILLING_FREE_WORKFLOW_CREDITS_FOR_TRIAL_PERIOD_WITHOUT_CREDIT_CARD',
          )
        );
      default:
        return 0;
    }
  }

  private getUnitPrice(price: BillingPrice): number {
    billingValidator.assertIsMeteredTiersSchemaOrThrow(price.tiers);

    return Number(price.tiers[1].unit_amount_decimal);
  }
}
