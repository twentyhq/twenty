import type Stripe from 'stripe';

export type SubscriptionWithSchedule = Omit<Stripe.Subscription, 'schedule'> & {
  schedule: Stripe.SubscriptionSchedule;
};
