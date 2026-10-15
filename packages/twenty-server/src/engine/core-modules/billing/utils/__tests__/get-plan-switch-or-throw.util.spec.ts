/* @license Enterprise */

import { BillingExceptionCode } from 'src/engine/core-modules/billing/billing.exception';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { getPlanSwitchOrThrow } from 'src/engine/core-modules/billing/utils/get-plan-switch-or-throw.util';

describe('getPlanSwitchOrThrow', () => {
  it.each([
    [BillingPlanKey.PRO, BillingPlanKey.ENTERPRISE],
    [BillingPlanKey.ENTERPRISE, BillingPlanKey.PRO],
  ])('allows %s to %s', (currentPlanKey, targetPlanKey) => {
    expect(getPlanSwitchOrThrow({ currentPlanKey, targetPlanKey })).toEqual({
      targetPlanKey,
    });
  });

  it('refuses a plan outside the current plan switches', () => {
    expect(() =>
      getPlanSwitchOrThrow({
        currentPlanKey: BillingPlanKey.PRO,
        targetPlanKey: BillingPlanKey.PRO_V2,
      }),
    ).toThrow(
      expect.objectContaining({
        code: BillingExceptionCode.BILLING_PLAN_NOT_ALLOWED,
      }),
    );
  });
});
