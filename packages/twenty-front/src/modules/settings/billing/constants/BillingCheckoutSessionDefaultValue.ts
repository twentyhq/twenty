import { type BillingCheckoutSession } from '@/auth/types/BillingCheckoutSession';
import { SubscriptionInterval } from '~/generated-metadata/graphql';

export const BILLING_CHECKOUT_SESSION_DEFAULT_VALUE: BillingCheckoutSession = {
  interval: SubscriptionInterval.Month,
  requirePaymentMethod: true,
};
