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
      proration: 'create_prorations',
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
      proration: 'create_prorations',
      metadata: {
        plan: BillingPlanKey.ENTERPRISE,
      },
    });
  });

  it('returns only proration for METERED_PRICE update type', () => {
    const result = computeSubscriptionUpdateOptions({
      type: SubscriptionUpdateType.METERED_PRICE,
      newMeteredPriceId: 'price_123',
    });

    expect(result).toEqual({
      proration: 'create_prorations',
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

  it('returns only proration for SEATS update type', () => {
    const result = computeSubscriptionUpdateOptions({
      type: SubscriptionUpdateType.SEATS,
      newSeats: 10,
    });

    expect(result).toEqual({
      proration: 'create_prorations',
    });
  });
});
