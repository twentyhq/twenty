import { currentUserState } from '@/auth/states/currentUserState';
import { isOnboardingAiChatEnabledState } from '@/client-config/states/isOnboardingAiChatEnabledState';
import { isOnboardingCheckoutPendingState } from '@/onboarding/states/isOnboardingCheckoutPendingState';
import { hasOpenedWorkspaceSetupChatSidePanelState } from '@/onboarding/states/hasOpenedWorkspaceSetupChatSidePanelState';
import { isWorkspaceSetupChatActiveState } from '@/ai-chat/states/isWorkspaceSetupChatActiveState';
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
      isOnboardingAiChatEnabledState.atom,
    );

    store.set(isOnboardingCheckoutPendingState.atom, false);
    store.set(isWorkspaceSetupChatActiveState.atom, isOnboardingAiChatEnabled);
    store.set(hasOpenedWorkspaceSetupChatSidePanelState.atom, false);
  };
};
