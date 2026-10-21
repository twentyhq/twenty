/* @license Enterprise */

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';

export const getCheckoutPlanKeyOrThrow = ({
  planKey,
  sellablePlanKeys,
}: {
  planKey?: BillingPlanKey | null;
  sellablePlanKeys: BillingPlanKey[];
}): BillingPlanKey => {
  const checkoutPlanKey = planKey ?? sellablePlanKeys[0];

  if (!sellablePlanKeys.includes(checkoutPlanKey)) {
    throw new BillingException(
      `Plan ${checkoutPlanKey} is not on sale`,
      BillingExceptionCode.BILLING_PLAN_NOT_ALLOWED,
    );
  }

  return checkoutPlanKey;
};
