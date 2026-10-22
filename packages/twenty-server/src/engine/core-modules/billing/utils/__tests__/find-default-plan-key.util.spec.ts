/* @license Enterprise */

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { findDefaultPlanKey } from 'src/engine/core-modules/billing/utils/find-default-plan-key.util';

describe('findDefaultPlanKey', () => {
  it('returns the plan marked isDefault', () => {
    expect(
      findDefaultPlanKey({
        [BillingPlanKey.PRO]: { upgradePlanKeys: [BillingPlanKey.ENTERPRISE] },
        [BillingPlanKey.ENTERPRISE]: {
          isDefault: true,
          downgradePlanKeys: [BillingPlanKey.PRO],
        },
      }),
    ).toBe(BillingPlanKey.ENTERPRISE);
  });

  it.each([
    {},
    {
      [BillingPlanKey.PRO]: { isDefault: true },
      [BillingPlanKey.ENTERPRISE]: { isDefault: true },
    },
  ])(
    'returns undefined unless exactly one plan is marked isDefault',
    (plansConfig) => {
      expect(findDefaultPlanKey(plansConfig)).toBeUndefined();
    },
  );
});
