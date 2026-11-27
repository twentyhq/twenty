/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import type Stripe from 'stripe';

import { type ApplicationSubscriptionItem } from 'src/engine/core-modules/billing/types/subscription-stripe-prices.type';

export const buildApplicationItemsUpdate = ({
  currentApplicationItems,
  targetApplicationItems,
}: {
  currentApplicationItems: (ApplicationSubscriptionItem & { id: string })[];
  targetApplicationItems: ApplicationSubscriptionItem[];
}): Stripe.SubscriptionUpdateParams.Item[] => {
  const updatedOrAddedItems = targetApplicationItems.flatMap(
    ({ stripeProductId, stripePriceId, quantity }) => {
      const currentItem = currentApplicationItems.find(
        (item) => item.stripeProductId === stripeProductId,
      );

      if (!isDefined(currentItem)) {
        return [{ price: stripePriceId, quantity }];
      }

      if (
        currentItem.stripePriceId === stripePriceId &&
        currentItem.quantity === quantity
      ) {
        return [];
      }

      return [{ id: currentItem.id, price: stripePriceId, quantity }];
    },
  );

  const deletedItems = currentApplicationItems
    .filter(
      ({ stripeProductId }) =>
        !targetApplicationItems.some(
          (item) => item.stripeProductId === stripeProductId,
        ),
    )
    .map(({ id }) => ({ id, deleted: true }));

  return [...updatedOrAddedItems, ...deletedItems];
};
