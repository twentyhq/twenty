/* @license Enterprise */

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { type SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

type IntervalPrice = {
  active: boolean;
  stripePriceId: string;
  interval?: SubscriptionInterval | null;
  metadata?: { isLegacy?: string | null } | null;
};

// Only the base product carries a single price per interval. A product priced
// in tiers holds one price per tier at every interval, so the tier is part of
// what identifies the price and this lookup does not apply to it.
export const findBaseProductPriceForIntervalOrThrow = <
  TPrice extends IntervalPrice,
>(
  billingProduct: {
    stripeProductId: string;
    metadata: { productKey: BillingProductKey };
    billingPrices?: TPrice[] | null;
  },
  interval: SubscriptionInterval,
): TPrice => {
  if (billingProduct.metadata.productKey !== BillingProductKey.BASE_PRODUCT) {
    throw new BillingException(
      `Product ${billingProduct.stripeProductId} is a ${billingProduct.metadata.productKey} product, which is not priced one price per interval`,
      BillingExceptionCode.BILLING_PRICE_INVALID,
    );
  }

  const intervalPrices = (billingProduct.billingPrices ?? []).filter(
    (billingPrice) => billingPrice.interval === interval && billingPrice.active,
  );

  if (intervalPrices.length === 0) {
    throw new BillingException(
      `No active ${interval} price on product ${billingProduct.stripeProductId}`,
      BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
    );
  }

  if (intervalPrices.length === 1) {
    return intervalPrices[0];
  }

  // Switching interval is not a sale: a workspace on superseded packaging is
  // changing interval on the product it already has, so isLegacy only breaks a
  // tie between two live prices at the same interval.
  const currentPrices = intervalPrices.filter(
    (billingPrice) => billingPrice.metadata?.isLegacy !== 'true',
  );

  if (currentPrices.length === 1) {
    return currentPrices[0];
  }

  throw new BillingException(
    `Expected a single billable ${interval} price on base product ${billingProduct.stripeProductId}, found ${intervalPrices.length}: ${intervalPrices
      .map((billingPrice) => billingPrice.stripePriceId)
      .join(', ')}. Mark the superseded price with metadata isLegacy=true.`,
    BillingExceptionCode.BILLING_PRICE_INVALID,
  );
};
