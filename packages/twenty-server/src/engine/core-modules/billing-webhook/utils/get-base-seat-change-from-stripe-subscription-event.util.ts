/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';
import type Stripe from 'stripe';

export const getBaseSeatChangeFromStripeSubscriptionEvent = (
  event: Stripe.CustomerSubscriptionUpdatedEvent,
  baseProductIds: string[],
): { previousSeats: number; seats: number } | null => {
  const isBaseItem = (item: Stripe.SubscriptionItem) => {
    const product = item.price.product;

    return baseProductIds.includes(
      typeof product === 'string' ? product : product.id,
    );
  };
  const previousItem =
    event.data.previous_attributes?.items?.data.find(isBaseItem);
  const currentItem = event.data.object.items.data.find(isBaseItem);

  if (
    !isDefined(previousItem?.quantity) ||
    !isDefined(currentItem?.quantity) ||
    previousItem.quantity === currentItem.quantity
  ) {
    return null;
  }

  return { previousSeats: previousItem.quantity, seats: currentItem.quantity };
};
