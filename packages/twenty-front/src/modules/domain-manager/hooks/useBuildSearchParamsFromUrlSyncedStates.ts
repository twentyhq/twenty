import { animateModalState } from '@/auth/states/animateModalState';
import { billingCheckoutSessionState } from '@/auth/states/billingCheckoutSessionState';
import { BILLING_CHECKOUT_SESSION_DEFAULT_VALUE } from '@/billing/constants/BillingCheckoutSessionDefaultValue';
import { useRecoilCallback } from 'recoil';

export const useBuildSearchParamsFromUrlSyncedStates = () => {
  const buildSearchParamsFromUrlSyncedStates = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const animateModal = snapshot.getLoadable(animateModalState).getValue();
        const billingCheckoutSession = snapshot
          .getLoadable(billingCheckoutSessionState)
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
