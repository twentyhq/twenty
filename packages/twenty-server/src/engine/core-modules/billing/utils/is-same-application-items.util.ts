/* @license Enterprise */

import { type ApplicationSubscriptionItem } from 'src/engine/core-modules/billing/types/subscription-stripe-prices.type';

export const isSameApplicationItems = ({
  currentApplicationItems,
  toUpdateApplicationItems,
}: {
  currentApplicationItems: ApplicationSubscriptionItem[];
  toUpdateApplicationItems: ApplicationSubscriptionItem[];
}): boolean =>
  currentApplicationItems.length === toUpdateApplicationItems.length &&
  currentApplicationItems.every(
    ({ stripeProductId, stripePriceId, quantity }) =>
      toUpdateApplicationItems.some(
        (item) =>
          item.stripeProductId === stripeProductId &&
          item.stripePriceId === stripePriceId &&
          item.quantity === quantity,
      ),
  );
