/* @license Enterprise */

import { BillingExceptionCode } from 'src/engine/core-modules/billing/billing.exception';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { getCheckoutPlanKeyOrThrow } from 'src/engine/core-modules/billing/utils/get-checkout-plan-key-or-throw.util';

describe('getCheckoutPlanKeyOrThrow', () => {
  it('refuses a plan that is not on sale', () => {
    expect(() =>
      getCheckoutPlanKeyOrThrow({ planKey: BillingPlanKey.PRO_V2 }),
    ).toThrow(
      expect.objectContaining({
        code: BillingExceptionCode.BILLING_PLAN_NOT_ALLOWED,
      }),
    );
  });
});
