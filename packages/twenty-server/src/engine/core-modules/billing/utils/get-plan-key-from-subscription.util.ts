import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';

export const getPlanKeyFromSubscription = (
  subscription: BillingSubscriptionEntity,
): BillingPlanKey => {
  const plan = subscription.metadata?.plan; //To do : #867  Naming issue decide if we should rename stripe product metadata planKey to plan (+ productKey to product) OR at session checkout creating subscription with metadata planKey (and not plan)

  switch (plan) {
    case 'PRO':
      return BillingPlanKey.PRO;
    case 'ENTERPRISE':
      return BillingPlanKey.ENTERPRISE;
    default:
      return BillingPlanKey.PRO;
  }
};
