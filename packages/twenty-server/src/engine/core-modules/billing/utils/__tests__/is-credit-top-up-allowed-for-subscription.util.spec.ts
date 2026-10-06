/* @license Enterprise */

import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { isCreditTopUpAllowedForSubscription } from 'src/engine/core-modules/billing/utils/is-credit-top-up-allowed-for-subscription.util';

const ACTIVE = {
  status: SubscriptionStatus.Active,
  cancelAt: null,
  cancelAtPeriodEnd: false,
};

describe('isCreditTopUpAllowedForSubscription', () => {
  it('allows an active subscription', () => {
    expect(isCreditTopUpAllowedForSubscription(ACTIVE)).toBe(true);
  });

  it.each([
    SubscriptionStatus.Trialing,
    SubscriptionStatus.PastDue,
    SubscriptionStatus.Unpaid,
    SubscriptionStatus.Canceled,
    SubscriptionStatus.Paused,
  ])('refuses a %s subscription', (status) => {
    expect(isCreditTopUpAllowedForSubscription({ ...ACTIVE, status })).toBe(
      false,
    );
  });

  it('refuses a subscription canceling at period end', () => {
    expect(
      isCreditTopUpAllowedForSubscription({
        ...ACTIVE,
        cancelAtPeriodEnd: true,
      }),
    ).toBe(false);
  });

  it('refuses a subscription with a scheduled cancellation date', () => {
    expect(
      isCreditTopUpAllowedForSubscription({
        ...ACTIVE,
        cancelAt: new Date('2026-12-01T00:00:00.000Z'),
      }),
    ).toBe(false);
  });
});
