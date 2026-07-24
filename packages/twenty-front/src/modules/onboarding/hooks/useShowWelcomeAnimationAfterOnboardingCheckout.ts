import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { checkIfFeatureFlagIsEnabledOnWorkspace } from '@/workspace/utils/checkIfFeatureFlagIsEnabledOnWorkspace';
import { isOnboardingCheckoutPendingState } from '@/onboarding/states/isOnboardingCheckoutPendingState';
import { isWelcomeAnimationVisibleState } from '@/onboarding/states/isWelcomeAnimationVisibleState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useStore } from 'jotai';
import { FeatureFlagKey, OnboardingStatus } from '~/generated-metadata/graphql';

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

    const isOnboardingAiChatEnabled = checkIfFeatureFlagIsEnabledOnWorkspace(
      FeatureFlagKey.IS_ONBOARDING_AI_CHAT_ENABLED,
      store.get(currentWorkspaceState.atom),
    );

    store.set(isOnboardingCheckoutPendingState.atom, false);
    store.set(isWelcomeAnimationVisibleState.atom, true);
    store.set(
      shouldOpenAiChatAfterOnboardingState.atom,
      isOnboardingAiChatEnabled,
    );
  };
};
