/* @license Enterprise */

import type Stripe from 'stripe';

import { getStripeSubscriptionPeriodEnd } from 'src/engine/core-modules/billing/utils/get-stripe-subscription-period-end.util';

const buildSubscription = (
  items: Array<{ current_period_end: number }>,
): Stripe.Subscription =>
  ({ items: { data: items } }) as unknown as Stripe.Subscription;

describe('getStripeSubscriptionPeriodEnd', () => {
  it('reads the period end off the first item', () => {
    expect(
      getStripeSubscriptionPeriodEnd(
        buildSubscription([
          { current_period_end: 1_800_000_000 },
          { current_period_end: 1_800_000_000 },
        ]),
      ),
    ).toBe(1_800_000_000);
  });

  it('gives nothing when no update was applied', () => {
    expect(getStripeSubscriptionPeriodEnd(undefined)).toBeUndefined();
  });

  it('gives nothing when the subscription carries no item', () => {
    expect(
      getStripeSubscriptionPeriodEnd(buildSubscription([])),
    ).toBeUndefined();
  });
});
