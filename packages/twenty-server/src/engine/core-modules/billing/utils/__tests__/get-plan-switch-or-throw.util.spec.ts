/* @license Enterprise */

import { BillingExceptionCode } from 'src/engine/core-modules/billing/billing.exception';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { type BillingPlanSwitches } from 'src/engine/core-modules/billing/types/billing-plan-switches.type';
import { getPlanSwitchOrThrow } from 'src/engine/core-modules/billing/utils/get-plan-switch-or-throw.util';

const planSwitches: BillingPlanSwitches = {
  [BillingPlanKey.PRO]: {
    upgradePlanKeys: [BillingPlanKey.ENTERPRISE, BillingPlanKey.PRO_V2],
  },
  [BillingPlanKey.ENTERPRISE]: { downgradePlanKeys: [BillingPlanKey.PRO] },
};

describe('getPlanSwitchOrThrow', () => {
  it.each([
    [BillingPlanKey.PRO, BillingPlanKey.ENTERPRISE],
    [BillingPlanKey.PRO, BillingPlanKey.PRO_V2],
    [BillingPlanKey.ENTERPRISE, BillingPlanKey.PRO],
  ])('allows %s to %s', (currentPlanKey, targetPlanKey) => {
    expect(
      getPlanSwitchOrThrow({ currentPlanKey, targetPlanKey, planSwitches }),
    ).toEqual({ targetPlanKey });
  });

  it('uses the single allowed switch when no target is given', () => {
    expect(
      getPlanSwitchOrThrow({
        currentPlanKey: BillingPlanKey.ENTERPRISE,
        planSwitches,
      }),
    ).toEqual({ targetPlanKey: BillingPlanKey.PRO });
  });

  it.each([
    {
      currentPlanKey: BillingPlanKey.PRO,
      targetPlanKey: BillingPlanKey.ORGANIZATION_V2,
    },
    {
      currentPlanKey: BillingPlanKey.PRO_V2,
      targetPlanKey: BillingPlanKey.ORGANIZATION_V2,
    },
    { currentPlanKey: BillingPlanKey.PRO, targetPlanKey: undefined },
  ])(
    'refuses $currentPlanKey to $targetPlanKey',
    ({ currentPlanKey, targetPlanKey }) => {
      expect(() =>
        getPlanSwitchOrThrow({ currentPlanKey, targetPlanKey, planSwitches }),
      ).toThrow(
        expect.objectContaining({
          code: BillingExceptionCode.BILLING_PLAN_NOT_ALLOWED,
        }),
      );
    },
  );
});
