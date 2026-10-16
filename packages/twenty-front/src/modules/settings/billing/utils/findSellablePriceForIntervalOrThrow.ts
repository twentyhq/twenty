import { type SubscriptionInterval } from '~/generated-metadata/graphql';

import { isSellableBillingPrice } from '@/settings/billing/utils/isSellableBillingPrice';
import { doNotTranslate } from 'twenty-shared/i18n';

type SellablePriceCandidate = {
  recurringInterval: SubscriptionInterval;
  stripePriceId: string;
  isSellable?: boolean | null;
};

// Mirrors the server: two live sellable prices at one interval would make the amount depend on catalog order.
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
      doNotTranslate(
        `Expected a single sellable ${interval} price, found ${sellablePrices.length}: ${sellablePrices
          .map((price) => price.stripePriceId)
          .join(', ')}`,
      ),
    );
  }

  return sellablePrices[0];
};
