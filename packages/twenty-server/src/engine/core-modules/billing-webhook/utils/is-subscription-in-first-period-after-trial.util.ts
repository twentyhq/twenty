/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import type Stripe from 'stripe';

export const isSubscriptionInFirstPeriodAfterTrial = (
  subscription: Pick<Stripe.Subscription, 'trial_end' | 'items'>,
): boolean =>
  isDefined(subscription.trial_end) &&
  subscription.items.data[0].current_period_start === subscription.trial_end;
