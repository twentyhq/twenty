import type Stripe from 'stripe';

export type SubscriptionWithSchedule = Omit<
  Stripe.Subscription,
  'schedule' | 'latest_invoice'
> & {
  schedule: Stripe.SubscriptionSchedule;
  latest_invoice: Stripe.Invoice | null;
};
