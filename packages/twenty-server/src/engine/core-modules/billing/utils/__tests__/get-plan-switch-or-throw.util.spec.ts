/* @license Enterprise */

import { BillingExceptionCode } from 'src/engine/core-modules/billing/billing.exception';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { getPlanSwitchOrThrow } from 'src/engine/core-modules/billing/utils/get-plan-switch-or-throw.util';

const PLAN_NOT_ALLOWED_ERROR = expect.objectContaining({
  code: BillingExceptionCode.BILLING_PLAN_NOT_ALLOWED,
});

describe('getPlanSwitchOrThrow', () => {
  it.each([
    [BillingPlanKey.PRO, BillingPlanKey.ORGANIZATION_V2],
    [BillingPlanKey.ENTERPRISE, BillingPlanKey.PRO_V2],
  ])('allows %s to %s', (currentPlanKey, targetPlanKey) => {
    expect(getPlanSwitchOrThrow({ currentPlanKey, targetPlanKey })).toEqual({
      targetPlanKey,
    });
  });

  it('refuses a switch between the legacy plans', () => {
    expect(() =>
      getPlanSwitchOrThrow({
        currentPlanKey: BillingPlanKey.PRO,
        targetPlanKey: BillingPlanKey.ENTERPRISE,
      }),
    ).toThrow(PLAN_NOT_ALLOWED_ERROR);
  });

  it('requires a target plan when several switches are allowed', () => {
    expect(() =>
      getPlanSwitchOrThrow({ currentPlanKey: BillingPlanKey.PRO }),
    ).toThrow(PLAN_NOT_ALLOWED_ERROR);
  });
});
