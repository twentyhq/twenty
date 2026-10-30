import { isBillingSubscriptionChangeUpgrade } from '@/settings/billing/utils/isBillingSubscriptionChangeUpgrade';
import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

describe('isBillingSubscriptionChangeUpgrade', () => {
  const proPlan = {
    upgradePlanKeys: [BillingPlanKey.ENTERPRISE],
    downgradePlanKeys: [],
  };
  const enterprisePlan = {
    upgradePlanKeys: [],
    downgradePlanKeys: [BillingPlanKey.PRO],
  };
  const proMonthlyUpcoming = {
    upcomingPlanKey: BillingPlanKey.PRO,
    upcomingInterval: SubscriptionInterval.Month,
  };
  const enterpriseYearlyUpcoming = {
    upcomingPlanKey: BillingPlanKey.ENTERPRISE,
    upcomingInterval: SubscriptionInterval.Year,
  };

  it('treats switching to an upgrade plan or to annual as upgrades', () => {
    expect(
      isBillingSubscriptionChangeUpgrade({
        change: {
          type: 'SWITCH_PLAN',
          targetPlanKey: BillingPlanKey.ENTERPRISE,
        },
        currentPlan: proPlan,
        ...proMonthlyUpcoming,
      }),
    ).toBe(true);
    expect(
      isBillingSubscriptionChangeUpgrade({
        change: {
          type: 'SWITCH_INTERVAL',
          targetInterval: SubscriptionInterval.Year,
        },
        currentPlan: proPlan,
        ...proMonthlyUpcoming,
      }),
    ).toBe(true);
    expect(
      isBillingSubscriptionChangeUpgrade({
        change: { type: 'SWITCH_PLAN', targetPlanKey: BillingPlanKey.PRO },
        currentPlan: enterprisePlan,
        ...enterpriseYearlyUpcoming,
      }),
    ).toBe(false);
    expect(
      isBillingSubscriptionChangeUpgrade({
        change: {
          type: 'SWITCH_INTERVAL',
          targetInterval: SubscriptionInterval.Month,
        },
        currentPlan: enterprisePlan,
        ...enterpriseYearlyUpcoming,
      }),
    ).toBe(false);
  });

  it('reads plan upgrades from the current plan switches', () => {
    const legacyProPlan = {
      upgradePlanKeys: [BillingPlanKey.PRO_V2, BillingPlanKey.ORGANIZATION_V2],
      downgradePlanKeys: [],
    };

    expect(
      isBillingSubscriptionChangeUpgrade({
        change: { type: 'SWITCH_PLAN', targetPlanKey: BillingPlanKey.PRO_V2 },
        currentPlan: legacyProPlan,
        ...proMonthlyUpcoming,
      }),
    ).toBe(true);
    expect(
      isBillingSubscriptionChangeUpgrade({
        change: {
          type: 'SWITCH_PLAN',
          targetPlanKey: BillingPlanKey.ENTERPRISE,
        },
        currentPlan: legacyProPlan,
        ...proMonthlyUpcoming,
      }),
    ).toBe(false);
  });

  it('treats cancelling a scheduled downgrade as an upgrade', () => {
    expect(
      isBillingSubscriptionChangeUpgrade({
        change: { type: 'CANCEL_PLAN_SWITCH' },
        currentPlan: enterprisePlan,
        ...proMonthlyUpcoming,
      }),
    ).toBe(true);
    expect(
      isBillingSubscriptionChangeUpgrade({
        change: { type: 'CANCEL_INTERVAL_SWITCH' },
        currentPlan: enterprisePlan,
        ...proMonthlyUpcoming,
      }),
    ).toBe(true);
    expect(
      isBillingSubscriptionChangeUpgrade({
        change: { type: 'CANCEL_PLAN_SWITCH' },
        currentPlan: proPlan,
        ...enterpriseYearlyUpcoming,
      }),
    ).toBe(false);
    expect(
      isBillingSubscriptionChangeUpgrade({
        change: { type: 'CANCEL_INTERVAL_SWITCH' },
        currentPlan: proPlan,
        ...enterpriseYearlyUpcoming,
      }),
    ).toBe(false);
  });
});
