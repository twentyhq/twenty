import { animateModalURLParamState } from '@/auth/states/animateModalURLParamState';
import { billingCheckoutSessionURLParamState } from '@/auth/states/billingCheckoutSessionURLParamState';
import { BILLING_CHECKOUT_SESSION_DEFAULT_VALUE } from '@/billing/constants/BillingCheckoutSessionDefaultValue';
import { useRecoilCallback } from 'recoil';

export const useBuildSearchParamsFromUrlSyncedStates = () => {
  const buildSearchParamsFromUrlSyncedStates = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const animateModal = snapshot.getLoadable(animateModalURLParamState).getValue();
        const billingCheckoutSession = snapshot
          .getLoadable(billingCheckoutSessionURLParamState)
          .getValue();

        const output = {
          ...(billingCheckoutSession !== BILLING_CHECKOUT_SESSION_DEFAULT_VALUE
            ? {
                billingCheckoutSession: JSON.stringify(billingCheckoutSession),
              }
            : {}),
          ...(animateModal === false ? { animateModal: 'false' } : {}),
        };

        return output;
      },
    [],
  );

  return {
    buildSearchParamsFromUrlSyncedStates,
  };
};
