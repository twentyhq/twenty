import { isBillingSubscriptionChangeImmediate } from '@/settings/billing/utils/isBillingSubscriptionChangeImmediate';
import {
  BillingPlanKey,
  SubscriptionInterval,
  SubscriptionStatus,
} from '~/generated-metadata/graphql';

describe('isBillingSubscriptionChangeImmediate', () => {
  it('applies upgrades immediately and downgrades at period end', () => {
    expect(
      isBillingSubscriptionChangeImmediate({
        change: {
          type: 'SWITCH_PLAN',
          targetPlanKey: BillingPlanKey.ENTERPRISE,
        },
        subscriptionStatus: SubscriptionStatus.Active,
      }),
    ).toBe(true);
    expect(
      isBillingSubscriptionChangeImmediate({
        change: { type: 'SWITCH_PLAN', targetPlanKey: BillingPlanKey.PRO },
        subscriptionStatus: SubscriptionStatus.Active,
      }),
    ).toBe(false);
    expect(
      isBillingSubscriptionChangeImmediate({
        change: {
          type: 'SWITCH_INTERVAL',
          targetInterval: SubscriptionInterval.Year,
        },
        subscriptionStatus: SubscriptionStatus.Active,
      }),
    ).toBe(true);
    expect(
      isBillingSubscriptionChangeImmediate({
        change: {
          type: 'SWITCH_INTERVAL',
          targetInterval: SubscriptionInterval.Month,
        },
        subscriptionStatus: SubscriptionStatus.Active,
      }),
    ).toBe(false);
  });

  it('applies every change immediately while trialing', () => {
    expect(
      isBillingSubscriptionChangeImmediate({
        change: { type: 'SWITCH_PLAN', targetPlanKey: BillingPlanKey.PRO },
        subscriptionStatus: SubscriptionStatus.Trialing,
      }),
    ).toBe(true);
    expect(
      isBillingSubscriptionChangeImmediate({
        change: {
          type: 'SWITCH_INTERVAL',
          targetInterval: SubscriptionInterval.Month,
        },
        subscriptionStatus: SubscriptionStatus.Trialing,
      }),
    ).toBe(true);
  });

  it('applies cancellations immediately', () => {
    expect(
      isBillingSubscriptionChangeImmediate({
        change: { type: 'CANCEL_PLAN_SWITCH' },
        subscriptionStatus: SubscriptionStatus.Active,
      }),
    ).toBe(true);
    expect(
      isBillingSubscriptionChangeImmediate({
        change: { type: 'CANCEL_INTERVAL_SWITCH' },
        subscriptionStatus: SubscriptionStatus.Active,
      }),
    ).toBe(true);
  });
});
