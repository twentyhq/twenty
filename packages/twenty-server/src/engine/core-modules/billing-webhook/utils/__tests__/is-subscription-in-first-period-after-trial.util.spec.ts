/* @license Enterprise */

import type Stripe from 'stripe';

import { isSubscriptionInFirstPeriodAfterTrial } from 'src/engine/core-modules/billing-webhook/utils/is-subscription-in-first-period-after-trial.util';

const TRIAL_END = 1788392892;

const buildSubscription = ({
  trialEnd,
  currentPeriodStart,
}: {
  trialEnd: number | null;
  currentPeriodStart: number;
}) =>
  ({
    trial_end: trialEnd,
    items: { data: [{ current_period_start: currentPeriodStart }] },
  }) as Pick<Stripe.Subscription, 'trial_end' | 'items'>;

describe('isSubscriptionInFirstPeriodAfterTrial', () => {
  it('should be true when the current period starts at trial end', () => {
    expect(
      isSubscriptionInFirstPeriodAfterTrial(
        buildSubscription({
          trialEnd: TRIAL_END,
          currentPeriodStart: TRIAL_END,
        }),
      ),
    ).toBe(true);
  });

  it('should be false once the subscription has renewed past its first paid period', () => {
    expect(
      isSubscriptionInFirstPeriodAfterTrial(
        buildSubscription({
          trialEnd: TRIAL_END,
          currentPeriodStart: TRIAL_END + 30 * 24 * 60 * 60,
        }),
      ),
    ).toBe(false);
  });

  it('should be false while the subscription is still in its trial', () => {
    expect(
      isSubscriptionInFirstPeriodAfterTrial(
        buildSubscription({
          trialEnd: TRIAL_END,
          currentPeriodStart: TRIAL_END - 7 * 24 * 60 * 60,
        }),
      ),
    ).toBe(false);
  });

  it('should be false for a subscription that never had a trial', () => {
    expect(
      isSubscriptionInFirstPeriodAfterTrial(
        buildSubscription({ trialEnd: null, currentPeriodStart: TRIAL_END }),
      ),
    ).toBe(false);
  });
});
