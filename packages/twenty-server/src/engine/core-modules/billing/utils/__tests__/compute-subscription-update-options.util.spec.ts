import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SubscriptionUpdateType } from 'src/engine/core-modules/billing/types/billing-subscription-update.type';
import { computeSubscriptionUpdateOptions } from 'src/engine/core-modules/billing/utils/compute-subscription-update-options.util';

describe('computeSubscriptionUpdateOptions', () => {
  it('returns proration and plan metadata for PLAN update type', () => {
    const result = computeSubscriptionUpdateOptions({
      type: SubscriptionUpdateType.PLAN,
      newPlan: BillingPlanKey.PRO,
    });

    expect(result).toEqual({
      proration: 'always_invoice',
      metadata: {
        plan: BillingPlanKey.PRO,
      },
    });
  });

  it('returns proration and enterprise plan metadata for PLAN update type', () => {
    const result = computeSubscriptionUpdateOptions({
      type: SubscriptionUpdateType.PLAN,
      newPlan: BillingPlanKey.ENTERPRISE,
    });

    expect(result).toEqual({
      proration: 'always_invoice',
      metadata: {
        plan: BillingPlanKey.ENTERPRISE,
      },
    });
  });

  it('returns no proration and plan metadata for PLAN update type during trial', () => {
    const result = computeSubscriptionUpdateOptions(
      {
        type: SubscriptionUpdateType.PLAN,
        newPlan: BillingPlanKey.ENTERPRISE,
      },
      { isTrialing: true },
    );

    expect(result).toEqual({
      proration: 'none',
      metadata: {
        plan: BillingPlanKey.ENTERPRISE,
      },
    });
  });

  it('returns proration and anchor for INTERVAL update type', () => {
    const result = computeSubscriptionUpdateOptions({
      type: SubscriptionUpdateType.INTERVAL,
      newInterval: SubscriptionInterval.Month,
    });

    expect(result).toEqual({
      proration: 'create_prorations',
      anchor: 'now',
    });
  });

  it('returns no proration or anchor for INTERVAL update type during trial', () => {
    const result = computeSubscriptionUpdateOptions(
      {
        type: SubscriptionUpdateType.INTERVAL,
        newInterval: SubscriptionInterval.Month,
      },
      { isTrialing: true },
    );

    expect(result).toEqual({
      proration: 'none',
    });
  });

  it('returns always_invoice when increasing seats', () => {
    const result = computeSubscriptionUpdateOptions(
      {
        type: SubscriptionUpdateType.SEATS,
        newSeats: 10,
      },
      { currentSeats: 5 },
    );

    expect(result).toEqual({
      proration: 'always_invoice',
    });
  });

  it('returns create_prorations when decreasing seats', () => {
    const result = computeSubscriptionUpdateOptions(
      {
        type: SubscriptionUpdateType.SEATS,
        newSeats: 5,
      },
      { currentSeats: 10 },
    );

    expect(result).toEqual({
      proration: 'create_prorations',
    });
  });

  it('returns create_prorations when seat count is unchanged', () => {
    const result = computeSubscriptionUpdateOptions(
      {
        type: SubscriptionUpdateType.SEATS,
        newSeats: 10,
      },
      { currentSeats: 10 },
    );

    expect(result).toEqual({
      proration: 'create_prorations',
    });
  });
});
