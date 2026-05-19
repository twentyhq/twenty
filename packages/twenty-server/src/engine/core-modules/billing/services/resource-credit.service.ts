/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';

export type ResourceCreditPricingInfo = {
  tierCap: number;
  unitPriceCents: number;
};

@Injectable()
export class ResourceCreditService {
  protected readonly logger = new Logger(ResourceCreditService.name);

  constructor(
    @InjectRepository(BillingSubscriptionEntity)
    private readonly billingSubscriptionRepository: Repository<BillingSubscriptionEntity>,
  ) {}

  extractResourceCreditPricingInfo(
    subscription: BillingSubscriptionEntity,
  ): ResourceCreditPricingInfo | null {
    const resourceCreditItem = subscription.billingSubscriptionItems?.find(
      (item) =>
        item.billingProduct?.metadata?.productKey ===
        BillingProductKey.RESOURCE_CREDIT,
    );

    if (!isDefined(resourceCreditItem)) {
      return null;
    }

    const matchingPrice =
      resourceCreditItem.billingProduct?.billingPrices?.find(
        (price) => price.stripePriceId === resourceCreditItem.stripePriceId,
      );

    if (!isDefined(matchingPrice)) {
      return null;
    }

    const tierCap = Number(matchingPrice.metadata?.credit_amount ?? 0);

    if (!Number.isFinite(tierCap) || tierCap <= 0) {
      return null;
    }

    return {
      tierCap,
      unitPriceCents: matchingPrice.unitAmount ?? 0,
    };
  }

  async getResourceCreditRolloverParameters(subscriptionId: string): Promise<{
    tierQuantity: number;
    unitPriceCents: number;
  } | null> {
    const subscription = await this.billingSubscriptionRepository.findOne({
      where: { id: subscriptionId },
      relations: [
        'billingSubscriptionItems',
        'billingSubscriptionItems.billingProduct',
        'billingSubscriptionItems.billingProduct.billingPrices',
      ],
    });

    if (!isDefined(subscription)) {
      return null;
    }

    const pricingInfo = this.extractResourceCreditPricingInfo(subscription);

    if (!isDefined(pricingInfo)) {
      return null;
    }

    return {
      tierQuantity: pricingInfo.tierCap,
      unitPriceCents: pricingInfo.unitPriceCents,
    };
  }
}
