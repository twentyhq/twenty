import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { JsonContains, Repository } from 'typeorm';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { type BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';

@Injectable()
export class BillingSubscriptionItemService {
  constructor(
    @InjectRepository(BillingSubscriptionItem, 'core')
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItem>,
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
        relations: ['billingProduct'],
      });

    if (!subscriptionItem) {
      throw new BillingException(
        `Cannot find subscription item for subscription ${subscriptionId}`,
        BillingExceptionCode.BILLING_SUBSCRIPTION_ITEM_NOT_FOUND,
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
          freeTierQuantity: this.getFreeTierQuantity(price),
          freeTrialQuantity: this.getFreeTrialQuantity(item),
          unitPriceCents: this.getUnitPrice(price),
        });
      },
      [] as Array<{
        stripeSubscriptionItemId: string;
        productKey: BillingProductKey;
        stripeMeterId: string;
        freeTierQuantity: number;
        freeTrialQuantity: number;
        unitPriceCents: number;
      }>,
    );
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

  private getFreeTierQuantity(price: BillingPrice): number {
    return price.tiers?.find((tier) => tier.unit_amount === 0)?.up_to || 0;
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
    return Number(
      price.tiers?.find((tier) => tier.up_to === null)?.unit_amount_decimal ||
        0,
    );
  }
}
