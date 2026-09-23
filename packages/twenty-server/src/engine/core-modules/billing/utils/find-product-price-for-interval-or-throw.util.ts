/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

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

// Switching interval is not a sale, so this resolves what is billable on the current product rather than what is sellable.
// isLegacy only breaks a tie between two active prices at the same interval.
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

  const [soleIntervalPrice] = intervalPrices;

  if (intervalPrices.length === 1 && isDefined(soleIntervalPrice)) {
    return soleIntervalPrice;
  }

  const currentPrices = intervalPrices.filter(
    (billingPrice) => billingPrice.metadata?.isLegacy !== 'true',
  );

  const [soleCurrentPrice] = currentPrices;

  if (currentPrices.length === 1 && isDefined(soleCurrentPrice)) {
    return soleCurrentPrice;
  }

  throw new BillingException(
    `Expected a single billable ${interval} price on product ${billingProduct.stripeProductId}, found ${intervalPrices.length}: ${intervalPrices
      .map((billingPrice) => billingPrice.stripePriceId)
      .join(', ')}. Mark the superseded price with metadata isLegacy=true.`,
    BillingExceptionCode.BILLING_PRICE_INVALID,
  );
};
