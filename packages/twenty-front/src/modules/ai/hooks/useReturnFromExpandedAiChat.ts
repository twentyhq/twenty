import { useStore } from 'jotai';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { aiChatExpandedReturnLocationState } from '@/ai/states/aiChatExpandedReturnLocationState';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';

type UseReturnFromExpandedAiChatParams = {
  reopenSidePanel: boolean;
};

export const useReturnFromExpandedAiChat = ({
  reopenSidePanel,
}: UseReturnFromExpandedAiChatParams) => {
  const store = useStore();
  const navigate = useNavigate();
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();
  const { closeSidePanelMenu } = useSidePanelMenu();

  return useCallback(() => {
    if (reopenSidePanel) {
      openAskAiPage({ resetNavigationStack: true });
    } else {
      void closeSidePanelMenu();
    }

    const returnLocation = store.get(aiChatExpandedReturnLocationState.atom);
    navigate(returnLocation ?? defaultHomePagePath);

    store.set(aiChatExpandedReturnLocationState.atom, null);
    store.set(shouldOpenAiChatAfterOnboardingState.atom, false);
  }, [
    reopenSidePanel,
    openAskAiPage,
    closeSidePanelMenu,
    store,
    navigate,
    defaultHomePagePath,
  ]);
};
