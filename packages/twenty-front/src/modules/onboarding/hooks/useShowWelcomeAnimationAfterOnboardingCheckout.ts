import { currentUserState } from '@/auth/states/currentUserState';
import { isOnboardingCheckoutPendingState } from '@/onboarding/states/isOnboardingCheckoutPendingState';
import { isWelcomeAnimationVisibleState } from '@/onboarding/states/isWelcomeAnimationVisibleState';
import { useStore } from 'jotai';
import { OnboardingStatus } from '~/generated-metadata/graphql';

export const useShowWelcomeAnimationAfterOnboardingCheckout = () => {
  const store = useStore();

  return () => {
    if (!store.get(isOnboardingCheckoutPendingState.atom)) {
      return;
    }

    const onboardingStatus = store.get(currentUserState.atom)?.onboardingStatus;

    if (onboardingStatus !== OnboardingStatus.COMPLETED) {
      return;
    }

    store.set(isOnboardingCheckoutPendingState.atom, false);
    store.set(isWelcomeAnimationVisibleState.atom, true);
  };
};
