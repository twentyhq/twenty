import { BillingCheckoutSession } from '@/auth/types/billingCheckoutSession.type';
import { BILLING_CHECKOUT_SESSION_DEFAULT_VALUE } from '@/billing/constants/BillingCheckoutSessionDefaultValue';
import { createState } from 'twenty-ui/utilities';

export const billingCheckoutSessionURLState = createState<BillingCheckoutSession>({
  key: 'billingCheckoutSessionURLState',
  defaultValue: BILLING_CHECKOUT_SESSION_DEFAULT_VALUE,
  effects: [
    ({ setSelf, onSet }) => {
      const searchParams = new URLSearchParams(window.location.search);
      const value = searchParams.get('billingCheckoutSession');

      if (value !== null) {
        const parsed = JSON.parse(decodeURIComponent(value));
        if (
          typeof parsed === 'object' &&
          parsed !== null &&
          'plan' in parsed &&
          'interval' in parsed &&
          'requirePaymentMethod' in parsed
        ) {
          setSelf(parsed as BillingCheckoutSession);
        }
      }

      onSet((newValue) => {
        const searchParams = new URLSearchParams(window.location.search);

        if (
          JSON.stringify(newValue) !==
          JSON.stringify(BILLING_CHECKOUT_SESSION_DEFAULT_VALUE)
        ) {
          searchParams.set(
            'billingCheckoutSession',
            encodeURIComponent(JSON.stringify(newValue)),
          );
        } else {
          searchParams.delete('billingCheckoutSession');
        }

        const newUrl = `${window.location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        window.history.replaceState({}, '', newUrl);
      });
    },
  ],
});
