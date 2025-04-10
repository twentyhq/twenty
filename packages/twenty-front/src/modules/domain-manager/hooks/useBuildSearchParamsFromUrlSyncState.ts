import { animateModalState } from '@/auth/states/animateModalState';
import { billingCheckoutSessionState } from '@/auth/states/billingCheckoutSessionState';
import { BILLING_CHECKOUT_SESSION_DEFAULT_VALUE } from '@/billing/constants/BillingCheckoutSessionDefaultValue';
import { useRecoilValue } from 'recoil';

export const useBuildSearchParamsFromUrlSyncState = () => {
  const billingCheckoutSession = useRecoilValue(billingCheckoutSessionState);
  const animateModal = useRecoilValue(animateModalState);

  const buildSearchParamsFromUrlSyncState = () => {
    return {
      ...(billingCheckoutSession !== BILLING_CHECKOUT_SESSION_DEFAULT_VALUE
        ? {
            billingCheckoutSession: JSON.stringify(billingCheckoutSession),
          }
        : {}),
      ...(animateModal === false ? { animateModal: 'false' } : {}),
    };
  };

  return {
    buildSearchParamsFromUrlSyncState,
  };
};
