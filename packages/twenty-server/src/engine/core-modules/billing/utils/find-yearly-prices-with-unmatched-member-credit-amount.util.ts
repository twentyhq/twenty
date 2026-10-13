/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { type BillingPriceMetadata } from 'src/engine/core-modules/billing/types/billing-price-metadata.type';
import { isSellableBillingPrice } from 'src/engine/core-modules/billing/utils/is-sellable-billing-price.util';

type SyncedBillingPrice = {
  stripePriceId: string;
  stripeProductId: string;
  active: boolean;
  interval?: SubscriptionInterval;
  metadata: BillingPriceMetadata;
};

// A yearly seat price carries the monthly slice amount, never twelve times it, so it must match a sold monthly price
export const findYearlyPricesWithUnmatchedMemberCreditAmount = <
  TPrice extends SyncedBillingPrice,
>({
  prices,
  baseProductStripeIds,
}: {
  prices: TPrice[];
  baseProductStripeIds: string[];
}): TPrice[] => {
  const seatPrices = prices.filter(({ stripeProductId }) =>
    baseProductStripeIds.includes(stripeProductId),
  );

  const monthlyMemberCreditAmountsByProductId = new Map<string, Set<string>>();

  for (const seatPrice of seatPrices) {
    const { stripeProductId, interval, metadata } = seatPrice;

    if (
      interval !== SubscriptionInterval.Month ||
      !isSellableBillingPrice(seatPrice) ||
      !isDefined(metadata.member_credit_amount)
    ) {
      continue;
    }

    const memberCreditAmounts =
      monthlyMemberCreditAmountsByProductId.get(stripeProductId) ??
      new Set<string>();

    memberCreditAmounts.add(metadata.member_credit_amount);
    monthlyMemberCreditAmountsByProductId.set(
      stripeProductId,
      memberCreditAmounts,
    );
  }

  return seatPrices.filter(({ stripeProductId, interval, metadata }) => {
    if (
      interval !== SubscriptionInterval.Year ||
      !isDefined(metadata.member_credit_amount)
    ) {
      return false;
    }

    const monthlyMemberCreditAmounts =
      monthlyMemberCreditAmountsByProductId.get(stripeProductId);

    return (
      !isDefined(monthlyMemberCreditAmounts) ||
      !monthlyMemberCreditAmounts.has(metadata.member_credit_amount)
    );
  });
};
