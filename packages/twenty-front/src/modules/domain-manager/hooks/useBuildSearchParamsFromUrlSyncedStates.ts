import { useCallback } from 'react';

import { billingCheckoutSessionState } from '@/auth/states/billingCheckoutSessionState';
import { BILLING_CHECKOUT_SESSION_DEFAULT_VALUE } from '@/billing/constants/BillingCheckoutSessionDefaultValue';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

export const useBuildSearchParamsFromUrlSyncedStates = () => {
  const buildSearchParamsFromUrlSyncedStates = useCallback(async () => {
    const billingCheckoutSession = jotaiStore.get(
      billingCheckoutSessionState.atom,
    );

    const output = {
      ...(billingCheckoutSession !== BILLING_CHECKOUT_SESSION_DEFAULT_VALUE
        ? {
            billingCheckoutSession: JSON.stringify(billingCheckoutSession),
          }
        : {}),
    };

    return output;
  }, []);

  return {
    buildSearchParamsFromUrlSyncedStates,
  };
};
