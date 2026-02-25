import { useCallback } from 'react';

import { billingCheckoutSessionState } from '@/auth/states/billingCheckoutSessionState';
import { type BillingCheckoutSession } from '@/auth/types/billingCheckoutSession.type';
import { BILLING_CHECKOUT_SESSION_DEFAULT_VALUE } from '@/billing/constants/BillingCheckoutSessionDefaultValue';
import deepEqual from 'deep-equal';
import { useStore } from 'jotai';

export const useInitializeQueryParamState = () => {
  const store = useStore();
  const initializeQueryParamState = useCallback(() => {
    const handlers = {
      billingCheckoutSession: (value: string) => {
        const billingCheckoutSession = store.get(
          billingCheckoutSessionState.atom,
        );

        try {
          const parsedValue = JSON.parse(decodeURIComponent(value));

          if (
            typeof parsedValue === 'object' &&
            parsedValue !== null &&
            'plan' in parsedValue &&
            'interval' in parsedValue &&
            'requirePaymentMethod' in parsedValue &&
            !deepEqual(billingCheckoutSession, parsedValue)
          ) {
            store.set(
              billingCheckoutSessionState.atom,
              parsedValue as BillingCheckoutSession,
            );
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(
            'Failed to parse billingCheckoutSession from URL',
            error,
          );
          store.set(
            billingCheckoutSessionState.atom,
            BILLING_CHECKOUT_SESSION_DEFAULT_VALUE,
          );
        }
      },
    };

    const queryParams = new URLSearchParams(window.location.search);

    for (const [paramName, handler] of Object.entries(handlers)) {
      const value = queryParams.get(paramName);
      if (value !== null) {
        handler(value);
      }
    }
  }, [store]);

  return { initializeQueryParamState };
};
