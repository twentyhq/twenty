import { useStore } from 'jotai';

import { useNavigateToAiChatPage } from '@/ai/hooks/useNavigateToAiChatPage';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useMainSurfaceLocation } from '@/ui/layout/hooks/useMainSurfaceLocation';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isAiChatInboxPath } from '~/utils/isAiChatInboxPath';
import { isAiChatPath } from '~/utils/isAiChatPath';

// Artifacts open in the side panel next to a full page chat; the onboarding
// chat owns the screen. On the inbox the chat is the side panel next to the
// list, so it moves full page and the artifact takes its place
export const useAiChatArtifactSurface = () => {
  const { pathname } = useMainSurfaceLocation();
  const store = useStore();
  const { navigateToAiChatPage } = useNavigateToAiChatPage();
  const shouldOpenAiChatAfterOnboarding = useAtomStateValue(
    shouldOpenAiChatAfterOnboardingState,
  );
  const isOnInboxPage = isAiChatInboxPath(pathname);

  const isAiChatArtifactSurface =
    (isAiChatPath(pathname) || isOnInboxPage) &&
    !shouldOpenAiChatAfterOnboarding;

  const openAiChatArtifact = ({
    sidePanelPath,
    openInSidePanel,
  }: {
    sidePanelPath: string;
    openInSidePanel: () => void;
  }) => {
    if (isOnInboxPage) {
      navigateToAiChatPage({
        threadId: store.get(currentAiChatThreadState.atom),
        sidePanelPath,
      });

      return;
    }

    openInSidePanel();
  };

  return { isAiChatArtifactSurface, openAiChatArtifact };
};
