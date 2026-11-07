/* @license Enterprise */

import { BillingExceptionCode } from 'src/engine/core-modules/billing/billing.exception';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { assertPlanIsSellableOrThrow } from 'src/engine/core-modules/billing/utils/assert-plan-is-sellable-or-throw.util';

const sellablePlanKeys = [
  BillingPlanKey.PRO_V2,
  BillingPlanKey.ORGANIZATION_V2,
];

describe('assertPlanIsSellableOrThrow', () => {
  it('accepts a plan on sale', () => {
    expect(() =>
      assertPlanIsSellableOrThrow({
        planKey: BillingPlanKey.ORGANIZATION_V2,
        sellablePlanKeys,
      }),
    ).not.toThrow();
  });

  it('refuses a plan that is not on sale', () => {
    expect(() =>
      assertPlanIsSellableOrThrow({
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
