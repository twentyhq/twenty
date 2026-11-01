import { useCallback } from 'react';

import { billingCheckoutSessionState } from '@/auth/states/billingCheckoutSessionState';
import { partnerCookieState } from '@/auth/states/partnerCookieState';
import { returnToPathState } from '@/auth/states/returnToPathState';
import { type BillingCheckoutSession } from '@/auth/types/BillingCheckoutSession';
import { isValidReturnToPath } from '@/auth/utils/isValidReturnToPath';
import { BILLING_CHECKOUT_SESSION_DEFAULT_VALUE } from '@/settings/billing/constants/BillingCheckoutSessionDefaultValue';
import { useStore } from 'jotai';
import { isDefined, normalizePartner } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

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
            'interval' in parsedValue &&
            'requirePaymentMethod' in parsedValue &&
            !isDeeplyEqual(billingCheckoutSession, parsedValue)
          ) {
            store.set(
              billingCheckoutSessionState.atom,
              parsedValue as BillingCheckoutSession,
            );
          }
        } catch (error) {
          // oxlint-disable-next-line no-console
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
        if (isValidReturnToPath(value)) {
          store.set(returnToPathState.atom, value);
        }
      },
      partner: (value: string) => {
        const partner = normalizePartner(value);

        if (isDefined(partner)) {
          store.set(partnerCookieState.atom, { partner });
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
