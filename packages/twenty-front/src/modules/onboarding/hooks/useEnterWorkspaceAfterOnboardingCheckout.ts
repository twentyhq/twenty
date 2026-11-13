import { currentUserState } from '@/auth/states/currentUserState';
import { isOnboardingInboxEnabledState } from '@/client-config/states/isOnboardingInboxEnabledState';
import { isOnboardingCheckoutPendingState } from '@/onboarding/states/isOnboardingCheckoutPendingState';
import { shouldOpenInboxAfterOnboardingState } from '@/onboarding/states/shouldOpenInboxAfterOnboardingState';
import { useStore } from 'jotai';
import { OnboardingStatus } from '~/generated-metadata/graphql';

export const useEnterWorkspaceAfterOnboardingCheckout = () => {
  const store = useStore();

  return () => {
    if (!store.get(isOnboardingCheckoutPendingState.atom)) {
      return;
    }

    const onboardingStatus = store.get(currentUserState.atom)?.onboardingStatus;

    if (onboardingStatus !== OnboardingStatus.COMPLETED) {
      return;
    }

    const isOnboardingAiChatEnabled = store.get(
      isOnboardingInboxEnabledState.atom,
    );

    store.set(isOnboardingCheckoutPendingState.atom, false);
    store.set(
      shouldOpenInboxAfterOnboardingState.atom,
      isOnboardingAiChatEnabled,
    );
  };
};
