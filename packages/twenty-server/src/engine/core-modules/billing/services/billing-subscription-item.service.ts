import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { billingValidator } from 'src/engine/core-modules/billing/billing.validate';

@Injectable()
export class BillingSubscriptionItemService {
  constructor(
    @InjectRepository(BillingSubscriptionItem)
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItem>,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

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
