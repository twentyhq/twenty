import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';

export const getOppositePlan = (plan: BillingPlanKey) => {
  if (plan === BillingPlanKey.PRO) return BillingPlanKey.ENTERPRISE;
  if (plan === BillingPlanKey.ENTERPRISE) return BillingPlanKey.PRO;
  throw new BillingException(
    `Plan invalid`,
    BillingExceptionCode.BILLING_PLAN_NOT_FOUND,
  );
};
