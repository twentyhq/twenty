/* @license Enterprise */

import { BillingExceptionCode } from 'src/engine/core-modules/billing/billing.exception';
import { BILLING_SELLABLE_PLAN_KEYS } from 'src/engine/core-modules/billing/constants/billing-sellable-plan-keys.constant';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { getCheckoutPlanKeyOrThrow } from 'src/engine/core-modules/billing/utils/get-checkout-plan-key-or-throw.util';

const V2_LAUNCH_SELLABLE_PLAN_KEYS = [
  BillingPlanKey.PRO_V2,
  BillingPlanKey.ORGANIZATION_V2,
];

describe('getCheckoutPlanKeyOrThrow', () => {
  it.each(BILLING_SELLABLE_PLAN_KEYS)(
    'accepts the sellable plan %s',
    (planKey) => {
      expect(getCheckoutPlanKeyOrThrow({ planKey })).toBe(planKey);
    },
  );

  it('defaults to the first sellable plan', () => {
    expect(getCheckoutPlanKeyOrThrow({})).toBe(BILLING_SELLABLE_PLAN_KEYS[0]);
    expect(getCheckoutPlanKeyOrThrow({ planKey: null })).toBe(
      BILLING_SELLABLE_PLAN_KEYS[0],
    );
    expect(
      getCheckoutPlanKeyOrThrow({
        sellablePlanKeys: V2_LAUNCH_SELLABLE_PLAN_KEYS,
      }),
    ).toBe(BillingPlanKey.PRO_V2);
  });

  it.each([BillingPlanKey.PRO, BillingPlanKey.ENTERPRISE])(
    'refuses the plan %s once it is no longer sold',
    (planKey) => {
      expect(() =>
        getCheckoutPlanKeyOrThrow({
          planKey,
          sellablePlanKeys: V2_LAUNCH_SELLABLE_PLAN_KEYS,
        }),
      ).toThrow(
        expect.objectContaining({
          code: BillingExceptionCode.BILLING_PLAN_NOT_ALLOWED,
        }),
      );
    },
  );
});
