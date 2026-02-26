import { useCallback } from 'react';

import { billingCheckoutSessionState } from '@/auth/states/billingCheckoutSessionState';
import { BILLING_CHECKOUT_SESSION_DEFAULT_VALUE } from '@/billing/constants/BillingCheckoutSessionDefaultValue';
import { useStore } from 'jotai';

export const useBuildSearchParamsFromUrlSyncedStates = () => {
  const store = useStore();
  const buildSearchParamsFromUrlSyncedStates = useCallback(async () => {
    const billingCheckoutSession = store.get(billingCheckoutSessionState.atom);

    const output = {
      ...(billingCheckoutSession !== BILLING_CHECKOUT_SESSION_DEFAULT_VALUE
        ? {
            billingCheckoutSession: JSON.stringify(billingCheckoutSession),
          }
        : {}),
    };

    return output;
  }, [store]);

  return {
    buildSearchParamsFromUrlSyncedStates,
  };
};
