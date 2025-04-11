import { BillingCheckoutSession } from '@/auth/types/billingCheckoutSession.type';
import { BILLING_CHECKOUT_SESSION_DEFAULT_VALUE } from '@/billing/constants/BillingCheckoutSessionDefaultValue';
import { atomWithStorage } from 'jotai/utils';

// Create a Jotai atom that syncs with URL query parameters
export const billingCheckoutSessionAtom =
  atomWithStorage<BillingCheckoutSession>(
    'billingCheckoutSession',
    BILLING_CHECKOUT_SESSION_DEFAULT_VALUE,
    {
      getItem: (key) => {
        const searchParams = new URLSearchParams(window.location.search);
        const value = searchParams.get(key);
        if (!value) return BILLING_CHECKOUT_SESSION_DEFAULT_VALUE;

        try {
          const parsed = JSON.parse(value);
          if (
            typeof parsed === 'object' &&
            parsed !== null &&
            'plan' in parsed &&
            'interval' in parsed &&
            'requirePaymentMethod' in parsed
          ) {
            return parsed as BillingCheckoutSession;
          }
          return BILLING_CHECKOUT_SESSION_DEFAULT_VALUE;
        } catch (e) {
          return BILLING_CHECKOUT_SESSION_DEFAULT_VALUE;
        }
      },
      setItem: (key, value) => {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set(key, JSON.stringify(value));
        const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
        window.history.replaceState({}, '', newUrl);
      },
      removeItem: (key) => {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.delete(key);
        const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
        window.history.replaceState({}, '', newUrl);
      },
    },
  );
