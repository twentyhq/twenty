import { BillingCheckoutSession } from '@/auth/types/billingCheckoutSession.type';
import { BILLING_CHECKOUT_SESSION_DEFAULT_VALUE } from '@/billing/constants/BillingCheckoutSessionDefaultValue';
import { createURLParamState } from '~/modules/ui/utilities/state/utils/createURLParamState';

const isBillingCheckoutSession = (
  value: unknown,
): value is BillingCheckoutSession => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'plan' in value &&
    'interval' in value &&
    'requirePaymentMethod' in value &&
    typeof (value as BillingCheckoutSession).plan === 'string' &&
    typeof (value as BillingCheckoutSession).interval === 'string' &&
    typeof (value as BillingCheckoutSession).requirePaymentMethod === 'boolean'
  );
};

export const billingCheckoutSessionURLParamState =
  createURLParamState<BillingCheckoutSession>({
    key: 'billingCheckoutSessionURLParamState',
    paramName: 'billingCheckoutSession',
    defaultValue: BILLING_CHECKOUT_SESSION_DEFAULT_VALUE,
    parseValue: (value) => {
      try {
        const parsed = JSON.parse(decodeURIComponent(value));
        if (isBillingCheckoutSession(parsed)) {
          return parsed;
        }
        console.warn('Invalid billing checkout session format:', parsed);
      } catch (e) {
        console.warn('Failed to parse billing checkout session:', e);
      }
      return null;
    },
  });
