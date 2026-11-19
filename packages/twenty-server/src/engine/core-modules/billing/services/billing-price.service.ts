/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { type BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingProductService } from 'src/engine/core-modules/billing/services/billing-product.service';
import { isSellableCatalogPrice } from 'src/engine/core-modules/billing/utils/is-sellable-catalog-price.util';

@Injectable()
export class BillingPriceService {
  protected readonly logger = new Logger(BillingPriceService.name);
  constructor(private readonly billingProductService: BillingProductService) {}

  async findEquivalentResourceCreditPrice({
    targetInterval,
    targetPlanKey,
    hasSameInterval,
    hasSamePlanKey,
    referencePrice,
  }: {
    targetInterval: SubscriptionInterval;
    targetPlanKey: BillingPlanKey;
    hasSameInterval: boolean;
    hasSamePlanKey: boolean;
    referencePrice: BillingPriceEntity;
  }): Promise<BillingPriceEntity> {
    if (hasSameInterval && hasSamePlanKey) {
      return referencePrice;
    }

    const catalog = await this.billingProductService.getProductPrices({
      interval: targetInterval,
      planKey: targetPlanKey,
    });

    const referenceCreditAmount = Number(
      referencePrice.metadata?.credit_amount,
    );

    const scaledAmount =
      !hasSameInterval && targetInterval === SubscriptionInterval.Year
        ? referenceCreditAmount * 12
        : !hasSameInterval && targetInterval === SubscriptionInterval.Month
          ? referenceCreditAmount / 12
          : referenceCreditAmount;

    const resourceCreditCandidates = catalog
      .filter(
        (p) =>
          p.billingProduct?.metadata?.productKey ===
            BillingProductKey.RESOURCE_CREDIT && isSellableCatalogPrice(p),
      )
      .sort(
        (a, b) =>
          Number(a.metadata?.credit_amount ?? 0) -
          Number(b.metadata?.credit_amount ?? 0),
      );

    if (!resourceCreditCandidates.length) {
      throw new BillingException(
        'No RESOURCE_CREDIT price candidates found',
        BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
      );
    }

    return (
      resourceCreditCandidates
        .filter((p) => Number(p.metadata?.credit_amount ?? 0) <= scaledAmount)
        .pop() ?? resourceCreditCandidates[0]
    );
  }
}
