import { useCallback } from 'react';

import { billingCheckoutSessionState } from '@/auth/states/billingCheckoutSessionState';
import { returnToPathState } from '@/auth/states/returnToPathState';
import { type BillingCheckoutSession } from '@/auth/types/billingCheckoutSession.type';
import { isValidReturnToPath } from '@/auth/utils/isValidReturnToPath';
import { writeReturnToPathToSessionStorage } from '@/auth/utils/returnToPathSessionStorage';
import { BILLING_CHECKOUT_SESSION_DEFAULT_VALUE } from '@/billing/constants/BillingCheckoutSessionDefaultValue';
import deepEqual from 'deep-equal';
import { useStore } from 'jotai';

export const useInitializeQueryParamState = () => {
  const store = useStore();
  const initializeQueryParamState = useCallback(() => {
    const handlers: Record<string, (value: string) => void> = {
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
      returnToPath: (value: string) => {
        try {
          const decodedValue = decodeURIComponent(value);

          if (isValidReturnToPath(decodedValue)) {
            store.set(returnToPathState.atom, decodedValue);
            writeReturnToPathToSessionStorage(decodedValue);
          }
        } catch {
          // malformed URI — ignore silently
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
