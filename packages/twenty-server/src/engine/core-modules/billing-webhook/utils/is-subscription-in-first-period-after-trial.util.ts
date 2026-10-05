/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import type Stripe from 'stripe';

// The first paid period starts exactly at trial_end, whenever Stripe gets
// around to finalizing its invoice, which can be days later.
export const isSubscriptionInFirstPeriodAfterTrial = (
  subscription: Pick<Stripe.Subscription, 'trial_end' | 'items'>,
): boolean => {
  const firstItem = subscription.items.data[0];

  return (
    isDefined(subscription.trial_end) &&
    isDefined(firstItem) &&
    firstItem.current_period_start === subscription.trial_end
  );
};
