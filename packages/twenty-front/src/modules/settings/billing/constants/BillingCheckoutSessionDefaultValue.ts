import { type BillingCheckoutSession } from '@/auth/types/billingCheckoutSession.type';
import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

export const BILLING_CHECKOUT_SESSION_DEFAULT_VALUE: BillingCheckoutSession = {
  plan: BillingPlanKey.PRO,
  interval: SubscriptionInterval.Month,
  requirePaymentMethod: true,
};
