import { type BillingCheckoutSession } from '@/auth/types/billingCheckoutSession.type';
import { BILLING_CHECKOUT_SESSION_DEFAULT_VALUE } from '@/billing/constants/BillingCheckoutSessionDefaultValue';
import { createState } from 'twenty-ui/utilities';

export const billingCheckoutSessionState = createState<BillingCheckoutSession>({
  key: 'billingCheckoutSessionState',
  defaultValue: BILLING_CHECKOUT_SESSION_DEFAULT_VALUE,
});
