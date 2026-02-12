import { type Stripe } from 'stripe';
import { assertIsDefinedOrThrow, findOrThrow } from 'twenty-shared/utils';

import { normalizePriceRef } from 'src/engine/core-modules/billing/utils/normalize-price-ref.utils';

export const getSubscriptionPricesFromSchedulePhase = (
  phase: Stripe.SubscriptionSchedule.Phase,
) => {
  const licensedItem = findOrThrow(
    phase.items,
    (item) => item.quantity != null,
  );

  assertIsDefinedOrThrow(licensedItem.quantity);
  const meteredItem = findOrThrow(phase.items, (item) => item.quantity == null);

  return {
    licensedPriceId: normalizePriceRef(licensedItem.price),
    meteredPriceId: normalizePriceRef(meteredItem.price),
    seats: licensedItem.quantity,
  };
};
