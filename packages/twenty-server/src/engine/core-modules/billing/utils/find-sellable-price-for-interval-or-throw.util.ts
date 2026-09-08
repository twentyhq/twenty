/* @license Enterprise */

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { type BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { type BillingProductEntity } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { type SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { isSellableBillingPrice } from 'src/engine/core-modules/billing/utils/is-sellable-billing-price.util';

// Product sellability is deliberately not checked: a workspace on superseded
// packaging must be able to switch interval without being moved off its product.
export const findSellablePriceForIntervalOrThrow = (
  billingProduct: BillingProductEntity,
  interval: SubscriptionInterval,
): BillingPriceEntity => {
  const sellablePrices = (billingProduct.billingPrices ?? []).filter(
    (billingPrice) =>
      billingPrice.interval === interval &&
      isSellableBillingPrice(billingPrice),
  );

  if (sellablePrices.length === 0) {
    throw new BillingException(
      `No sellable ${interval} price on product ${billingProduct.stripeProductId}`,
      BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
    );
  }

  if (sellablePrices.length > 1) {
    throw new BillingException(
      `Expected a single sellable ${interval} price on product ${billingProduct.stripeProductId}, found ${sellablePrices.length}: ${sellablePrices
        .map((billingPrice) => billingPrice.stripePriceId)
        .join(', ')}. Mark the superseded price with metadata isLegacy=true.`,
      BillingExceptionCode.BILLING_PRICE_INVALID,
    );
  }

  return sellablePrices[0];
};
