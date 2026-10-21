import { type SubscriptionInterval } from '~/generated-metadata/graphql';

export type BillingCheckoutSession = {
  interval: SubscriptionInterval;
  requirePaymentMethod: boolean;
};
