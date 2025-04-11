import { animateModalState } from '@/auth/states/animateModalState';
import { billingCheckoutSessionState } from '@/auth/states/billingCheckoutSessionState';
import { useRecoilCallback } from 'recoil';

export const useInitializeUrlStates = () => {
  const initializeUrlStates = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        snapshot.getLoadable(billingCheckoutSessionState).getValue();
        snapshot.getLoadable(animateModalState).getValue();
      },
    [],
  );

  return { initializeUrlStates };
};
