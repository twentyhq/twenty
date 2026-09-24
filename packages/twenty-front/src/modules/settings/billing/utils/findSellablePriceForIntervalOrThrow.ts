import { type SubscriptionInterval } from '~/generated-metadata/graphql';

import { isSellableBillingPrice } from '@/settings/billing/utils/isSellableBillingPrice';

type SellablePriceCandidate = {
  recurringInterval: SubscriptionInterval;
  stripePriceId: string;
  isSellable?: boolean | null;
};

// Mirrors the server: two live sellable prices at one interval would make the
// displayed and charged amount depend on catalog order.
export const findSellablePriceForIntervalOrThrow = <
  TPrice extends SellablePriceCandidate,
>(
  prices: TPrice[],
  interval: SubscriptionInterval,
): TPrice => {
  const sellablePrices = prices.filter(
    (price) =>
      price.recurringInterval === interval && isSellableBillingPrice(price),
  );

  if (sellablePrices.length !== 1) {
    throw new Error(
      `Expected a single sellable ${interval} price, found ${sellablePrices.length}: ${sellablePrices
        .map((price) => price.stripePriceId)
        .join(', ')}`,
    );
  }

  return sellablePrices[0];
};
