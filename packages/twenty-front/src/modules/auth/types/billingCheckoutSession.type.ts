import {
  type SubscriptionInterval,
  type BillingPlanKey,
} from '~/generated-metadata/graphql';

export type BillingCheckoutSession = {
  plan: BillingPlanKey;
  interval: SubscriptionInterval;
  requirePaymentMethod: boolean;
};
