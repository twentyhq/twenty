/* @license Enterprise */

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BILLING_SELLABLE_PLAN_KEYS } from 'src/engine/core-modules/billing/constants/billing-sellable-plan-keys.constant';
import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';

export const getCheckoutPlanKeyOrThrow = ({
  planKey,
}: {
  planKey?: BillingPlanKey | null;
}): BillingPlanKey => {
  const checkoutPlanKey = planKey ?? BILLING_SELLABLE_PLAN_KEYS[0];

  if (!BILLING_SELLABLE_PLAN_KEYS.includes(checkoutPlanKey)) {
    throw new BillingException(
      `Plan ${checkoutPlanKey} is not on sale`,
      BillingExceptionCode.BILLING_PLAN_NOT_ALLOWED,
    );
  }

  return checkoutPlanKey;
};
