/* @license Enterprise */

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';

export const assertPlanIsSellableOrThrow = ({
  planKey,
  sellablePlanKeys,
}: {
  planKey: BillingPlanKey;
  sellablePlanKeys: BillingPlanKey[];
}): void => {
  if (!sellablePlanKeys.includes(planKey)) {
    throw new BillingException(
      `Plan ${planKey} is not on sale`,
      BillingExceptionCode.BILLING_PLAN_NOT_ALLOWED,
    );
  }
};
