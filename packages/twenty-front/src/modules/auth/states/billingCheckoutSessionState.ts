import { type BillingCheckoutSession } from '@/auth/types/billingCheckoutSession.type';
import { BILLING_CHECKOUT_SESSION_DEFAULT_VALUE } from '@/billing/constants/BillingCheckoutSessionDefaultValue';
import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const billingCheckoutSessionState = createState<BillingCheckoutSession>({
  key: 'billingCheckoutSessionState',
  defaultValue: BILLING_CHECKOUT_SESSION_DEFAULT_VALUE,
});
