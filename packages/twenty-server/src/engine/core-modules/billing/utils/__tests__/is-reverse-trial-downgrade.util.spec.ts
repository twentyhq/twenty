/* @license Enterprise */

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { isReverseTrialDowngrade } from 'src/engine/core-modules/billing/utils/is-reverse-trial-downgrade.util';

const REVERSE_TRIAL_PLANS_CONFIG = {
  [BillingPlanKey.ORGANIZATION_V2]: {
    isDefault: true,
    downgradePlanKeys: [BillingPlanKey.PRO_V2],
  },
  [BillingPlanKey.PRO_V2]: {
    upgradePlanKeys: [BillingPlanKey.ORGANIZATION_V2],
  },
};

const LEGACY_PLANS_CONFIG = {
  [BillingPlanKey.PRO]: {
    isDefault: true,
    upgradePlanKeys: [BillingPlanKey.ENTERPRISE],
  },
  [BillingPlanKey.ENTERPRISE]: { downgradePlanKeys: [BillingPlanKey.PRO] },
};

describe('isReverseTrialDowngrade', () => {
  it('is true for the switch from the trial plan to its downgrade target', () => {
    expect(
      isReverseTrialDowngrade({
        plansConfig: REVERSE_TRIAL_PLANS_CONFIG,
        currentPlanKey: BillingPlanKey.ORGANIZATION_V2,
        targetPlanKey: BillingPlanKey.PRO_V2,
      }),
    ).toBe(true);
  });

  it.each([
    {
      plansConfig: REVERSE_TRIAL_PLANS_CONFIG,
      currentPlanKey: BillingPlanKey.PRO_V2,
      targetPlanKey: BillingPlanKey.ORGANIZATION_V2,
    },
    {
      plansConfig: REVERSE_TRIAL_PLANS_CONFIG,
      currentPlanKey: BillingPlanKey.ORGANIZATION_V2,
      targetPlanKey: BillingPlanKey.ORGANIZATION_V2,
    },
    {
      plansConfig: LEGACY_PLANS_CONFIG,
      currentPlanKey: BillingPlanKey.ENTERPRISE,
      targetPlanKey: BillingPlanKey.PRO,
    },
  ])(
    'is false for $currentPlanKey to $targetPlanKey otherwise',
    (switchArgs) => {
      expect(isReverseTrialDowngrade(switchArgs)).toBe(false);
    },
  );
});
