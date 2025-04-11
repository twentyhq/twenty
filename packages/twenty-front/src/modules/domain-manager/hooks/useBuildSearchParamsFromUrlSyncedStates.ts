import { animateModalURLState } from '@/auth/states/animateModalURLState';
import { billingCheckoutSessionURLState } from '@/auth/states/billingCheckoutSessionURLState';
import { BILLING_CHECKOUT_SESSION_DEFAULT_VALUE } from '@/billing/constants/BillingCheckoutSessionDefaultValue';
import { useRecoilCallback } from 'recoil';

export const useBuildSearchParamsFromUrlSyncedStates = () => {
  const buildSearchParamsFromUrlSyncedStates = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const animateModal = snapshot.getLoadable(animateModalURLState).getValue();
        const billingCheckoutSession = snapshot
          .getLoadable(billingCheckoutSessionURLState)
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
