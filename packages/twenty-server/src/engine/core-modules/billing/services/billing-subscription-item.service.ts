import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Raw, Repository } from 'typeorm';

import { differenceInDays } from 'date-fns';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { isDefined } from 'twenty-shared/utils';

@Injectable()
export class BillingSubscriptionItemService {
  constructor(
    @InjectRepository(BillingSubscriptionItemEntity)
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItemEntity>,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async getResourceCreditSubscriptionItemDetails(
    subscription: BillingSubscriptionEntity,
  ): Promise<{
    stripeSubscriptionItemId: string;
    productKey: BillingProductKey;
    creditAmount: number;
    freeTrialQuantity: number;
    unitPriceCents: number;
  } | null> {
    const item = await this.billingSubscriptionItemRepository.findOne({
      where: {
        billingSubscriptionId: subscription.id,
        billingProduct: {
          metadata: Raw((alias) => `${alias} @> :metadata::jsonb`, {
            metadata: JSON.stringify({
              productKey: BillingProductKey.RESOURCE_CREDIT,
            }),
          }),
        },
      },
      relations: ['billingProduct', 'billingProduct.billingPrices'],
    });

    if (!item) {
      return null;
    }

    const price = this.findMatchingPrice(item);

    const trialDuration =
      isDefined(subscription.trialEnd) && isDefined(subscription.trialStart)
        ? differenceInDays(subscription.trialEnd, subscription.trialStart)
        : 0;

    const trialWithCreditCardDuration = this.twentyConfigService.get(
      'BILLING_FREE_TRIAL_WITH_CREDIT_CARD_DURATION_IN_DAYS',
    );

    return {
      stripeSubscriptionItemId: item.stripeSubscriptionItemId,
      productKey: BillingProductKey.RESOURCE_CREDIT,
      creditAmount: Number(price.metadata?.credit_amount ?? 0),
      freeTrialQuantity: this.twentyConfigService.get(
        trialDuration === trialWithCreditCardDuration
          ? 'BILLING_FREE_WORKFLOW_CREDITS_FOR_TRIAL_PERIOD_WITH_CREDIT_CARD'
          : 'BILLING_FREE_WORKFLOW_CREDITS_FOR_TRIAL_PERIOD_WITHOUT_CREDIT_CARD',
      ),
      unitPriceCents: price.unitAmount ?? 0,
    };
  }

  private findMatchingPrice(
    item: BillingSubscriptionItemEntity,
  ): BillingPriceEntity {
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
}
