import { isBillingSubscriptionChangeUpgrade } from '@/settings/billing/utils/isBillingSubscriptionChangeUpgrade';
import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

describe('isBillingSubscriptionChangeUpgrade', () => {
  const proMonthlyUpcoming = {
    upcomingPlanKey: BillingPlanKey.PRO,
    upcomingInterval: SubscriptionInterval.Month,
  };
  const enterpriseYearlyUpcoming = {
    upcomingPlanKey: BillingPlanKey.ENTERPRISE,
    upcomingInterval: SubscriptionInterval.Year,
  };

  it('treats switching to Organization or to annual as upgrades', () => {
    expect(
      isBillingSubscriptionChangeUpgrade({
        change: {
          type: 'SWITCH_PLAN',
          targetPlanKey: BillingPlanKey.ENTERPRISE,
        },
        ...proMonthlyUpcoming,
      }),
    ).toBe(true);
    expect(
      isBillingSubscriptionChangeUpgrade({
        change: {
          type: 'SWITCH_INTERVAL',
          targetInterval: SubscriptionInterval.Year,
        },
        ...proMonthlyUpcoming,
      }),
    ).toBe(true);
    expect(
      isBillingSubscriptionChangeUpgrade({
        change: { type: 'SWITCH_PLAN', targetPlanKey: BillingPlanKey.PRO },
        ...enterpriseYearlyUpcoming,
      }),
    ).toBe(false);
    expect(
      isBillingSubscriptionChangeUpgrade({
        change: {
          type: 'SWITCH_INTERVAL',
          targetInterval: SubscriptionInterval.Month,
        },
        ...enterpriseYearlyUpcoming,
      }),
    ).toBe(false);
  });

  it('treats cancelling a scheduled downgrade as an upgrade', () => {
    expect(
      isBillingSubscriptionChangeUpgrade({
        change: { type: 'CANCEL_PLAN_SWITCH' },
        ...proMonthlyUpcoming,
      }),
    ).toBe(true);
    expect(
      isBillingSubscriptionChangeUpgrade({
        change: { type: 'CANCEL_INTERVAL_SWITCH' },
        ...proMonthlyUpcoming,
      }),
    ).toBe(true);
    expect(
      isBillingSubscriptionChangeUpgrade({
        change: { type: 'CANCEL_PLAN_SWITCH' },
        ...enterpriseYearlyUpcoming,
      }),
    ).toBe(false);
    expect(
      isBillingSubscriptionChangeUpgrade({
        change: { type: 'CANCEL_INTERVAL_SWITCH' },
        ...enterpriseYearlyUpcoming,
      }),
    ).toBe(false);
  });
});
