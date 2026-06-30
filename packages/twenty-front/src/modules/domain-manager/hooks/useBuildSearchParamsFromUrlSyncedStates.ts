import { useCallback } from 'react';

import { billingCheckoutSessionState } from '@/auth/states/billingCheckoutSessionState';
import { isOnboardingV2State } from '@/auth/states/isOnboardingV2State';
import { returnToPathState } from '@/auth/states/returnToPathState';
import { BILLING_CHECKOUT_SESSION_DEFAULT_VALUE } from '@/settings/billing/constants/BillingCheckoutSessionDefaultValue';
import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';

export const useBuildSearchParamsFromUrlSyncedStates = () => {
  const store = useStore();
  const buildSearchParamsFromUrlSyncedStates = useCallback(async () => {
    const billingCheckoutSession = store.get(billingCheckoutSessionState.atom);
    const returnToPath = store.get(returnToPathState.atom);
    const isOnboardingV2 = store.get(isOnboardingV2State.atom);

    const output = {
      ...(billingCheckoutSession !== BILLING_CHECKOUT_SESSION_DEFAULT_VALUE
        ? {
            billingCheckoutSession: JSON.stringify(billingCheckoutSession),
          }
        : {}),
      ...(isNonEmptyString(returnToPath) ? { returnToPath } : {}),
      ...(isOnboardingV2 ? { onboardingV2: 'true' } : {}),
    };

    return output;
  }, [store]);

  return {
    buildSearchParamsFromUrlSyncedStates,
  };
};
