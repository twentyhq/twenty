import { SubscriptionInterval } from '~/generated-metadata/graphql';
import { BillingPlanKey } from '~/generated/graphql';

export type BillingCheckoutSession = {
  plan: BillingPlanKey;
  interval: SubscriptionInterval;
  requirePaymentMethod: boolean;
};
