/* @license Enterprise */

import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { isCreditOneTimeTopUpAllowedForSubscription } from 'src/engine/core-modules/billing/utils/is-credit-one-time-top-up-allowed-for-subscription.util';

const ACTIVE = {
  status: SubscriptionStatus.Active,
  cancelAt: null,
  cancelAtPeriodEnd: false,
};

describe('isCreditOneTimeTopUpAllowedForSubscription', () => {
  it('allows an active subscription', () => {
    expect(isCreditOneTimeTopUpAllowedForSubscription(ACTIVE)).toBe(true);
  });

  it.each([
    SubscriptionStatus.Trialing,
    SubscriptionStatus.PastDue,
    SubscriptionStatus.Unpaid,
    SubscriptionStatus.Canceled,
    SubscriptionStatus.Paused,
  ])('refuses a %s subscription', (status) => {
    expect(
      isCreditOneTimeTopUpAllowedForSubscription({ ...ACTIVE, status }),
    ).toBe(false);
  });

  it('refuses a subscription canceling at period end', () => {
    expect(
      isCreditOneTimeTopUpAllowedForSubscription({
        ...ACTIVE,
        cancelAtPeriodEnd: true,
      }),
    ).toBe(false);
  });

  it('refuses a subscription with a scheduled cancellation date', () => {
    expect(
      isCreditOneTimeTopUpAllowedForSubscription({
        ...ACTIVE,
        cancelAt: new Date('2026-12-01T00:00:00.000Z'),
      }),
    ).toBe(false);
  });
});
