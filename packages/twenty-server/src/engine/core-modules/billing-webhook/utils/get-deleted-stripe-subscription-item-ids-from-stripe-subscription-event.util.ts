/* @license Enterprise */

import Stripe from 'stripe';
import { isDefined } from 'twenty-shared/utils';

export const getDeletedStripeSubscriptionItemIdsFromStripeSubscriptionEvent = (
  event:
    | Stripe.CustomerSubscriptionUpdatedEvent
    | Stripe.CustomerSubscriptionCreatedEvent
    | Stripe.CustomerSubscriptionDeletedEvent,
): string[] => {
  const hasUpdatedSubscriptionItems = isDefined(
    event.data.previous_attributes?.items?.data,
  );

  if (!hasUpdatedSubscriptionItems) {
    return [];
  }

  const subscriptionItemIds =
    event.data.object.items.data.map((item) => item.id) ?? [];

  const deletedSubscriptionItemIds =
    event.data.previous_attributes?.items?.data
      .filter((item) => !subscriptionItemIds.includes(item.id))
      .map((item) => item.id) ?? [];

  return deletedSubscriptionItemIds;
};
