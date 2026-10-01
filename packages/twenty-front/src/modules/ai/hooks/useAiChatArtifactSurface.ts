import { useStore } from 'jotai';
import { useLocation } from 'react-router-dom';

import { useNavigateToAiChatPage } from '@/ai/hooks/useNavigateToAiChatPage';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isAiChatInboxPath } from '~/utils/isAiChatInboxPath';
import { isAiChatPath } from '~/utils/isAiChatPath';

// Artifacts open in the side panel next to a full page chat; the onboarding
// chat owns the screen. On the inbox the chat is the side panel next to the
// list, so it moves full page and the artifact takes its place
export const useAiChatArtifactSurface = () => {
  const { pathname } = useLocation();
  const store = useStore();
  const { navigateToAiChatPage } = useNavigateToAiChatPage();
  const shouldOpenAiChatAfterOnboarding = useAtomStateValue(
    shouldOpenAiChatAfterOnboardingState,
  );
  const isOnInboxPage = isAiChatInboxPath(pathname);

  const isAiChatArtifactSurface =
    (isAiChatPath(pathname) || isOnInboxPage) &&
    !shouldOpenAiChatAfterOnboarding;

  const openAiChatArtifact = (
    openInSidePanel: (options: { resetNavigationStack: boolean }) => void,
  ) => {
    if (isOnInboxPage) {
      navigateToAiChatPage({
        threadId: store.get(currentAiChatThreadState.atom),
        shouldCloseSidePanel: false,
      });
    }

    openInSidePanel({ resetNavigationStack: isOnInboxPage });
  };

  return { isAiChatArtifactSurface, openAiChatArtifact };
};
