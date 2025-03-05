import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';

export const getPlanKeyFromSubscription = (
  subscription: BillingSubscription,
): BillingPlanKey => {
  const planKey = subscription.metadata?.planKey;

  switch (planKey) {
    case 'PRO':
      return BillingPlanKey.PRO;
    case 'ENTERPRISE':
      return BillingPlanKey.ENTERPRISE;
    default:
      return BillingPlanKey.PRO;
  }
};
