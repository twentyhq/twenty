/* @license Enterprise */

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { isResourceCreditPriceForSubscription } from 'src/engine/core-modules/billing/utils/is-resource-credit-price-for-subscription.util';

const buildPrice = (
  interval: SubscriptionInterval,
  planKey: BillingPlanKey | undefined,
) => ({
  interval,
  billingProduct: { metadata: { planKey } },
});

describe('isResourceCreditPriceForSubscription', () => {
  it('accepts a price on the same interval and plan', () => {
    expect(
      isResourceCreditPriceForSubscription({
        billingPrice: buildPrice(
          SubscriptionInterval.Month,
          BillingPlanKey.PRO,
        ),
        interval: SubscriptionInterval.Month,
        planKey: BillingPlanKey.PRO,
      }),
    ).toBe(true);
  });

  it('refuses a price from the other interval', () => {
    expect(
      isResourceCreditPriceForSubscription({
        billingPrice: buildPrice(SubscriptionInterval.Year, BillingPlanKey.PRO),
        interval: SubscriptionInterval.Month,
        planKey: BillingPlanKey.PRO,
      }),
    ).toBe(false);
  });

  it('refuses a price from another plan', () => {
    expect(
      isResourceCreditPriceForSubscription({
        billingPrice: buildPrice(
          SubscriptionInterval.Month,
          BillingPlanKey.ENTERPRISE,
        ),
        interval: SubscriptionInterval.Month,
        planKey: BillingPlanKey.PRO,
      }),
    ).toBe(false);
  });

  it('refuses a price whose product carries no plan', () => {
    expect(
      isResourceCreditPriceForSubscription({
        billingPrice: { interval: SubscriptionInterval.Month },
        interval: SubscriptionInterval.Month,
        planKey: BillingPlanKey.PRO,
      }),
    ).toBe(false);
  });
});
