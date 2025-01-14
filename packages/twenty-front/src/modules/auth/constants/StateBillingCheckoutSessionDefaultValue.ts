import { BillingCheckoutSession } from '@/auth/types/billingCheckoutSession.type';
import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

export const STATE_BILLING_CHECKOUT_SESSION_DEFAULT_VALUE: BillingCheckoutSession =
  {
    plan: BillingPlanKey.Pro,
    interval: SubscriptionInterval.Month,
    requirePaymentMethod: true,
  };
