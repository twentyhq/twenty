/* @license Enterprise */

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { type SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

type IntervalPrice = {
  active: boolean;
  stripePriceId: string;
  interval?: SubscriptionInterval | null;
  metadata?: { isLegacy?: string | null } | null;
};

// Switching interval is not a sale: a workspace on superseded packaging is
// changing interval on the product it already has, so this resolves what is
// billable on that product rather than what is sellable. isLegacy only breaks a
// tie between two live prices at the same interval.
export const findProductPriceForIntervalOrThrow = <
  TPrice extends IntervalPrice,
>(
  billingProduct: {
    stripeProductId: string;
    billingPrices?: TPrice[] | null;
  },
  interval: SubscriptionInterval,
): TPrice => {
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

  const currentPrices = intervalPrices.filter(
    (billingPrice) => billingPrice.metadata?.isLegacy !== 'true',
  );

  if (currentPrices.length === 1) {
    return currentPrices[0];
  }

  throw new BillingException(
    `Expected a single billable ${interval} price on product ${billingProduct.stripeProductId}, found ${intervalPrices.length}: ${intervalPrices
      .map((billingPrice) => billingPrice.stripePriceId)
      .join(', ')}. Mark the superseded price with metadata isLegacy=true.`,
    BillingExceptionCode.BILLING_PRICE_INVALID,
  );
};
