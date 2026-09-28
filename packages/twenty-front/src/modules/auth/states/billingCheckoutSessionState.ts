import { type BillingCheckoutSession } from '@/auth/types/BillingCheckoutSession';
import { BILLING_CHECKOUT_SESSION_DEFAULT_VALUE } from '@/settings/billing/constants/BillingCheckoutSessionDefaultValue';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const billingCheckoutSessionState =
  createAtomState<BillingCheckoutSession>({
    key: 'billingCheckoutSessionState',
    defaultValue: BILLING_CHECKOUT_SESSION_DEFAULT_VALUE,
  });
