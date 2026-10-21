/* @license Enterprise */

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { findCheckoutDefaultPlanKey } from 'src/engine/core-modules/billing/utils/find-checkout-default-plan-key.util';

describe('findCheckoutDefaultPlanKey', () => {
  it('returns the plan on sale that has no downgrade', () => {
    expect(
      findCheckoutDefaultPlanKey({
        [BillingPlanKey.PRO]: { upgradePlanKeys: [BillingPlanKey.ENTERPRISE] },
        [BillingPlanKey.ENTERPRISE]: {
          downgradePlanKeys: [BillingPlanKey.PRO],
        },
      }),
    ).toBe(BillingPlanKey.PRO);
  });

  it('returns undefined when more than one plan on sale has no downgrade', () => {
    expect(
      findCheckoutDefaultPlanKey({
        [BillingPlanKey.PRO]: { upgradePlanKeys: [BillingPlanKey.ENTERPRISE] },
        [BillingPlanKey.ENTERPRISE]: { upgradePlanKeys: [BillingPlanKey.PRO] },
      }),
    ).toBeUndefined();
  });
});
