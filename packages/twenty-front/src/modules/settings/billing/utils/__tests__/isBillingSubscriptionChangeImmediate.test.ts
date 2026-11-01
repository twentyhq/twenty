import { isBillingSubscriptionChangeImmediate } from '@/settings/billing/utils/isBillingSubscriptionChangeImmediate';
import {
  BillingPlanKey,
  SubscriptionInterval,
  SubscriptionStatus,
} from '~/generated-metadata/graphql';

describe('isBillingSubscriptionChangeImmediate', () => {
  const proPlan = {
    upgradePlanKeys: [BillingPlanKey.ENTERPRISE],
    downgradePlanKeys: [],
  };
  const enterprisePlan = {
    upgradePlanKeys: [],
    downgradePlanKeys: [BillingPlanKey.PRO],
  };

  it('applies upgrades immediately and downgrades at period end', () => {
    expect(
      isBillingSubscriptionChangeImmediate({
        change: {
          type: 'SWITCH_PLAN',
          targetPlanKey: BillingPlanKey.ENTERPRISE,
        },
        currentPlan: proPlan,
        subscriptionStatus: SubscriptionStatus.Active,
      }),
    ).toBe(true);
    expect(
      isBillingSubscriptionChangeImmediate({
        change: { type: 'SWITCH_PLAN', targetPlanKey: BillingPlanKey.PRO },
        currentPlan: enterprisePlan,
        subscriptionStatus: SubscriptionStatus.Active,
      }),
    ).toBe(false);
    expect(
      isBillingSubscriptionChangeImmediate({
        change: {
          type: 'SWITCH_INTERVAL',
          targetInterval: SubscriptionInterval.Year,
        },
        currentPlan: proPlan,
        subscriptionStatus: SubscriptionStatus.Active,
      }),
    ).toBe(true);
    expect(
      isBillingSubscriptionChangeImmediate({
        change: {
          type: 'SWITCH_INTERVAL',
          targetInterval: SubscriptionInterval.Month,
        },
        currentPlan: proPlan,
        subscriptionStatus: SubscriptionStatus.Active,
      }),
    ).toBe(false);
  });

  it('defers a plan switch only when the target is a downgrade of the current plan', () => {
    const legacyEnterprisePlan = {
      upgradePlanKeys: [BillingPlanKey.ORGANIZATION_V2],
      downgradePlanKeys: [BillingPlanKey.PRO_V2],
    };

    expect(
      isBillingSubscriptionChangeImmediate({
        change: {
          type: 'SWITCH_PLAN',
          targetPlanKey: BillingPlanKey.ORGANIZATION_V2,
        },
        currentPlan: legacyEnterprisePlan,
        subscriptionStatus: SubscriptionStatus.Active,
      }),
    ).toBe(true);
    expect(
      isBillingSubscriptionChangeImmediate({
        change: { type: 'SWITCH_PLAN', targetPlanKey: BillingPlanKey.PRO_V2 },
        currentPlan: legacyEnterprisePlan,
        subscriptionStatus: SubscriptionStatus.Active,
      }),
    ).toBe(false);
  });

  it('applies every change immediately while trialing', () => {
    expect(
      isBillingSubscriptionChangeImmediate({
        change: { type: 'SWITCH_PLAN', targetPlanKey: BillingPlanKey.PRO },
        currentPlan: enterprisePlan,
        subscriptionStatus: SubscriptionStatus.Trialing,
      }),
    ).toBe(true);
    expect(
      isBillingSubscriptionChangeImmediate({
        change: {
          type: 'SWITCH_INTERVAL',
          targetInterval: SubscriptionInterval.Month,
        },
        currentPlan: enterprisePlan,
        subscriptionStatus: SubscriptionStatus.Trialing,
      }),
    ).toBe(true);
  });

  it('applies cancellations immediately', () => {
    expect(
      isBillingSubscriptionChangeImmediate({
        change: { type: 'CANCEL_PLAN_SWITCH' },
        currentPlan: enterprisePlan,
        subscriptionStatus: SubscriptionStatus.Active,
      }),
    ).toBe(true);
    expect(
      isBillingSubscriptionChangeImmediate({
        change: { type: 'CANCEL_INTERVAL_SWITCH' },
        currentPlan: enterprisePlan,
        subscriptionStatus: SubscriptionStatus.Active,
      }),
    ).toBe(true);
  });
});
