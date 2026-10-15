import { type BillingCheckoutSession } from '@/auth/types/BillingCheckoutSession';
import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

export const BILLING_CHECKOUT_SESSION_DEFAULT_VALUE: BillingCheckoutSession = {
  plan: BillingPlanKey.PRO_V2,
  interval: SubscriptionInterval.Month,
  requirePaymentMethod: true,
};
