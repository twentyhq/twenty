/* @license Enterprise */

import { BillingExceptionCode } from 'src/engine/core-modules/billing/billing.exception';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { getCheckoutPlanKeyOrThrow } from 'src/engine/core-modules/billing/utils/get-checkout-plan-key-or-throw.util';

const sellablePlanKeys = [
  BillingPlanKey.PRO_V2,
  BillingPlanKey.ORGANIZATION_V2,
];

describe('getCheckoutPlanKeyOrThrow', () => {
  it('defaults to the first plan on sale', () => {
    expect(getCheckoutPlanKeyOrThrow({ sellablePlanKeys })).toBe(
      BillingPlanKey.PRO_V2,
    );
  });

  it('keeps a requested plan that is on sale', () => {
    expect(
      getCheckoutPlanKeyOrThrow({
        planKey: BillingPlanKey.ORGANIZATION_V2,
        sellablePlanKeys,
      }),
    ).toBe(BillingPlanKey.ORGANIZATION_V2);
  });

  it('refuses a plan that is not on sale', () => {
    expect(() =>
      getCheckoutPlanKeyOrThrow({
        planKey: BillingPlanKey.PRO,
        sellablePlanKeys,
      }),
    ).toThrow(
      expect.objectContaining({
        code: BillingExceptionCode.BILLING_PLAN_NOT_ALLOWED,
      }),
    );
  });
});
