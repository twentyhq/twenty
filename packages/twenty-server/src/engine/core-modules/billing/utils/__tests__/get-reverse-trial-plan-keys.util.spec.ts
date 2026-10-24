/* @license Enterprise */

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { getReverseTrialPlanKeys } from 'src/engine/core-modules/billing/utils/get-reverse-trial-plan-keys.util';

describe('getReverseTrialPlanKeys', () => {
  it('returns the default plan and its downgrade target', () => {
    expect(
      getReverseTrialPlanKeys({
        [BillingPlanKey.ORGANIZATION_V2]: {
          isDefault: true,
          downgradePlanKeys: [BillingPlanKey.PRO_V2],
        },
        [BillingPlanKey.PRO_V2]: {
          upgradePlanKeys: [BillingPlanKey.ORGANIZATION_V2],
        },
      }),
    ).toEqual({
      trialPlanKey: BillingPlanKey.ORGANIZATION_V2,
      downgradePlanKey: BillingPlanKey.PRO_V2,
    });
  });

  it('returns undefined when the default plan has no downgrade target', () => {
    expect(
      getReverseTrialPlanKeys({
        [BillingPlanKey.PRO]: {
          isDefault: true,
          upgradePlanKeys: [BillingPlanKey.ENTERPRISE],
        },
        [BillingPlanKey.ENTERPRISE]: {
          downgradePlanKeys: [BillingPlanKey.PRO],
        },
      }),
    ).toBeUndefined();
  });
});
