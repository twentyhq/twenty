import { type BillingCheckoutSession } from '@/auth/types/billingCheckoutSession.type';
import { BILLING_CHECKOUT_SESSION_DEFAULT_VALUE } from '@/billing/constants/BillingCheckoutSessionDefaultValue';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const billingCheckoutSessionState =
  createStateV2<BillingCheckoutSession>({
    key: 'billingCheckoutSessionState',
    defaultValue: BILLING_CHECKOUT_SESSION_DEFAULT_VALUE,
  });
