import { BillingCheckoutSession } from '@/auth/types/billingCheckoutSession.type';
import { BILLING_CHECKOUT_SESSION_DEFAULT_VALUE } from '@/billing/constants/BillingCheckoutSessionDefaultValue';
import { createURLParamState } from '~/modules/ui/utilities/state/utils/createURLParamState';

export const billingCheckoutSessionURLParamState =
  createURLParamState<BillingCheckoutSession>({
    key: 'billingCheckoutSessionURLParamState',
    paramName: 'billingCheckoutSession',
    defaultValue: BILLING_CHECKOUT_SESSION_DEFAULT_VALUE,
    parseValue: (value) => {
      try {
        const parsed = JSON.parse(decodeURIComponent(value));
        if (
          typeof parsed === 'object' &&
          parsed !== null &&
          'plan' in parsed &&
          'interval' in parsed &&
          'requirePaymentMethod' in parsed
        ) {
          return parsed as BillingCheckoutSession;
        }
      } catch (e) {
        // If parsing fails, return null
      }
      return null;
    },
  });
