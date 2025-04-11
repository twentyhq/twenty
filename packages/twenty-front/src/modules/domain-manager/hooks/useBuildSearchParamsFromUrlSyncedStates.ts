import { animateModalState } from '@/auth/states/animateModalState';
import { billingCheckoutSessionAtom } from '@/auth/states/billingCheckoutSessionAtom';
import { BILLING_CHECKOUT_SESSION_DEFAULT_VALUE } from '@/billing/constants/BillingCheckoutSessionDefaultValue';
import { useAtomValue } from 'jotai';
import { useRecoilCallback } from 'recoil';

export const useBuildSearchParamsFromUrlSyncedStates = () => {
  const billingCheckoutSession = useAtomValue(billingCheckoutSessionAtom);

  const buildSearchParamsFromUrlSyncedStates = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const animateModal = snapshot.getLoadable(animateModalState).getValue();

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
    [billingCheckoutSession],
  );

  return {
    buildSearchParamsFromUrlSyncedStates,
  };
};
