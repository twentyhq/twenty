import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { JsonContains, Repository } from 'typeorm';

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

@Injectable()
export class BillingSubscriptionItemService {
  constructor(
    @InjectRepository(BillingSubscriptionItem, 'core')
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItem>,
    @InjectRepository(BillingPrice, 'core')
    private readonly billingPriceRepository: Repository<BillingPrice>,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly stripeSubscriptionService: StripeSubscriptionService,
  ) {}

  async updateMeteredSubscriptionItemPrice(
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
        relations: ['billingProduct', 'billingProduct.billingPrices'],
      });

    if (!subscriptionItem) {
      throw new BillingException(
        `Cannot find subscription item for subscription ${subscriptionId}`,
        BillingExceptionCode.BILLING_SUBSCRIPTION_ITEM_NOT_FOUND,
      );
    }

    const currentBillingPrice = subscriptionItem
      ? this.findMatchingPrice(subscriptionItem)
      : null;

    if (!currentBillingPrice) {
      throw new BillingException(
        `Cannot find price for product ${subscriptionItem.stripeProductId}`,
        BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
      );
    }

    const newPrice = await this.billingPriceRepository.findOne({
      where: { stripePriceId: newPriceId },
    });

    if (!newPrice) {
      throw new BillingException(
        `Cannot find price with id ${newPriceId}`,
        BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
      );
    }

    if (
      !this.isFirstPriceTiersLowerThatSecondPriceTier(
        currentBillingPrice,
        newPrice,
      )
    ) {
      throw new BillingException(
        'Cannot update price of subscription item because the new tier is lower than the current tier.',
        BillingExceptionCode.BILLING_PRICE_UPDATE_REQUIRES_INCREASE,
      );
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
          item.metadata.trialPeriodFreeWorkflowCredits ||
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
