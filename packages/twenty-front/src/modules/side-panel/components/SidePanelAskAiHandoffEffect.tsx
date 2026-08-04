import { useStore } from 'jotai';
import { useLayoutEffect } from 'react';

import { aiChatExpandedReturnLocationState } from '@/ai/states/aiChatExpandedReturnLocationState';
import { shouldContinueAiChatInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';

export const SidePanelAskAiHandoffEffect = () => {
  const store = useStore();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();

  useLayoutEffect(() => {
    if (!store.get(shouldContinueAiChatInSidePanelState.atom)) {
      return;
    }

    store.set(shouldContinueAiChatInSidePanelState.atom, false);
    store.set(shouldOpenAiChatAfterOnboardingState.atom, false);
    store.set(aiChatExpandedReturnLocationState.atom, null);

    openAskAiPage({ resetNavigationStack: true });
  }, [store, openAskAiPage]);

  return null;
};
