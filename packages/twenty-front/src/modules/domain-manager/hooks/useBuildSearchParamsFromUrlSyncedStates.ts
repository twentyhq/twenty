import { useCallback } from 'react';

import { billingCheckoutSessionState } from '@/auth/states/billingCheckoutSessionState';
import { returnToPathState } from '@/auth/states/returnToPathState';
import { BILLING_CHECKOUT_SESSION_DEFAULT_VALUE } from '@/settings/billing/constants/BillingCheckoutSessionDefaultValue';
import { i18n } from '@lingui/core';
import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';

export const useBuildSearchParamsFromUrlSyncedStates = () => {
  const store = useStore();
  const buildSearchParamsFromUrlSyncedStates = useCallback(async () => {
    const billingCheckoutSession = store.get(billingCheckoutSessionState.atom);
    const returnToPath = store.get(returnToPathState.atom);

    const output = {
      ...(billingCheckoutSession !== BILLING_CHECKOUT_SESSION_DEFAULT_VALUE
        ? {
            billingCheckoutSession: JSON.stringify(billingCheckoutSession),
          }
        : {}),
      ...(isNonEmptyString(returnToPath) ? { returnToPath } : {}),
      ...(isNonEmptyString(i18n.locale) ? { locale: i18n.locale } : {}),
    };

    return output;
  }, [store]);

  return {
    buildSearchParamsFromUrlSyncedStates,
  };
};
