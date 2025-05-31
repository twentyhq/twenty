import { BillingCheckoutSession } from '@/auth/types/billingCheckoutSession.type';
import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';
import { BillingPaymentProviders } from '~/generated/graphql';

export const BILLING_CHECKOUT_SESSION_DEFAULT_VALUE: BillingCheckoutSession = {
  plan: BillingPlanKey.PRO,
  interval: SubscriptionInterval.Month,
  requirePaymentMethod: true,
  paymentProvider: BillingPaymentProviders.Stripe,
};
