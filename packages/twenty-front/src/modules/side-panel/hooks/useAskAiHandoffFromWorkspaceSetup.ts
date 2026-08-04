import { useReducedMotion } from 'framer-motion';
import { useStore } from 'jotai';
import { useLayoutEffect, useState } from 'react';

import { aiChatExpandedReturnLocationState } from '@/ai/states/aiChatExpandedReturnLocationState';
import { shouldContinueAiChatInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';

export const useAskAiHandoffFromWorkspaceSetup = () => {
  const store = useStore();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();
  const shouldReduceMotion = useReducedMotion();

  // Read during the first render, before the layout effect below consumes the
  // marker, so the very first paint already carries the entrance animation.
  const [isContinuingChatFromWorkspaceSetup] = useState(() =>
    store.get(shouldContinueAiChatInSidePanelState.atom),
  );

  useLayoutEffect(() => {
    if (!store.get(shouldContinueAiChatInSidePanelState.atom)) {
      return;
    }

    store.set(shouldContinueAiChatInSidePanelState.atom, false);
    store.set(shouldOpenAiChatAfterOnboardingState.atom, false);
    store.set(aiChatExpandedReturnLocationState.atom, null);

    openAskAiPage({ resetNavigationStack: true });
  }, [store, openAskAiPage]);

  return {
    shouldShrinkFromFullWidth:
      isContinuingChatFromWorkspaceSetup && !shouldReduceMotion,
  };
};
