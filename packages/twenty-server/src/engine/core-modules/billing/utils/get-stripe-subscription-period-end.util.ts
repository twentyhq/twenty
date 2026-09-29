/* @license Enterprise */

import type Stripe from 'stripe';

export const getStripeSubscriptionPeriodEnd = (
  stripeSubscription: Stripe.Subscription | undefined,
): number | undefined => stripeSubscription?.items.data[0]?.current_period_end;
