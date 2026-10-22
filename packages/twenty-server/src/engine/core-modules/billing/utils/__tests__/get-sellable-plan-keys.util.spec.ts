/* @license Enterprise */

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { getSellablePlanKeys } from 'src/engine/core-modules/billing/utils/get-sellable-plan-keys.util';

describe('getSellablePlanKeys', () => {
  it('returns the plans some plan can switch to', () => {
    expect(
      getSellablePlanKeys({
        [BillingPlanKey.PRO]: {
          upgradePlanKeys: [
            BillingPlanKey.PRO_V2,
            BillingPlanKey.ORGANIZATION_V2,
          ],
        },
        [BillingPlanKey.PRO_V2]: {
          upgradePlanKeys: [BillingPlanKey.ORGANIZATION_V2],
        },
        [BillingPlanKey.ORGANIZATION_V2]: {
          downgradePlanKeys: [BillingPlanKey.PRO_V2],
        },
      }),
    ).toEqual([BillingPlanKey.PRO_V2, BillingPlanKey.ORGANIZATION_V2]);
  });

  it('returns no plan without switches', () => {
    expect(getSellablePlanKeys({})).toEqual([]);
  });
});
