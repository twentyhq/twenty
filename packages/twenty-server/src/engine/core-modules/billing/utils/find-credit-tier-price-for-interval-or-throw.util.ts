/* @license Enterprise */

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

const MONTHS_PER_YEAR = 12;

type CreditTierPrice = {
  active: boolean;
  stripePriceId: string;
  interval?: SubscriptionInterval | null;
  metadata?: { credit_amount?: string | null } | null;
};

const getCreditAmount = (billingPrice: CreditTierPrice): number =>
  Number(billingPrice.metadata?.credit_amount);

export const findCreditTierPriceForIntervalOrThrow = <
  TPrice extends CreditTierPrice,
>(
  billingProduct: {
    stripeProductId: string;
    metadata: { productKey: BillingProductKey };
    billingPrices?: TPrice[] | null;
  },
  {
    referencePrice,
    targetInterval,
  }: {
    referencePrice: CreditTierPrice;
    targetInterval: SubscriptionInterval;
  },
): TPrice => {
  if (
    billingProduct.metadata.productKey !== BillingProductKey.RESOURCE_CREDIT
  ) {
    throw new BillingException(
      `Product ${billingProduct.stripeProductId} is a ${billingProduct.metadata.productKey} product, which is not priced in credit tiers`,
      BillingExceptionCode.BILLING_PRICE_INVALID,
    );
  }

  const referenceCreditAmount = getCreditAmount(referencePrice);

  if (!Number.isFinite(referenceCreditAmount) || referenceCreditAmount <= 0) {
    throw new BillingException(
      `Price ${referencePrice.stripePriceId} carries no credit_amount to match a tier on`,
      BillingExceptionCode.BILLING_PRICE_INVALID,
    );
  }

  const targetTiers = (billingProduct.billingPrices ?? []).filter(
    (billingPrice) =>
      billingPrice.interval === targetInterval &&
      billingPrice.active &&
      Number.isFinite(getCreditAmount(billingPrice)) &&
      getCreditAmount(billingPrice) > 0,
  );

  if (targetTiers.length === 0) {
    throw new BillingException(
      `No active ${targetInterval} credit tier on product ${billingProduct.stripeProductId}`,
      BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
    );
  }

  const targetCreditAmount =
    referencePrice.interval === targetInterval
      ? referenceCreditAmount
      : targetInterval === SubscriptionInterval.Year
        ? referenceCreditAmount * MONTHS_PER_YEAR
        : referenceCreditAmount / MONTHS_PER_YEAR;

  // The yearly ladder is not the monthly one times twelve: its entry tier is
  // deliberately smaller, so the counterpart tier is the closest one in ratio
  // rather than an exact multiple, and a tie goes to the cheaper tier.
  const getTierDistance = (billingPrice: TPrice): number =>
    Math.abs(Math.log(getCreditAmount(billingPrice) / targetCreditAmount));

  return targetTiers.reduce((closestTier, billingPrice) => {
    const distance = getTierDistance(billingPrice);
    const closestDistance = getTierDistance(closestTier);

    if (distance === closestDistance) {
      return getCreditAmount(billingPrice) < getCreditAmount(closestTier)
        ? billingPrice
        : closestTier;
    }

    return distance < closestDistance ? billingPrice : closestTier;
  });
};
