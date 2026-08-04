import { useReducedMotion } from 'framer-motion';
import { useStore } from 'jotai';
import { useEffect, useLayoutEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { aiChatExpandedReturnLocationState } from '@/ai/states/aiChatExpandedReturnLocationState';
import { shouldContinueAiChatInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';

export const useAskAiHandoffFromWorkspaceSetup = () => {
  const store = useStore();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();
  const shouldReduceMotion = useReducedMotion();

  const [isSidePanelEnteringAtFullWidth, setIsSidePanelEnteringAtFullWidth] =
    useState(false);

  useLayoutEffect(() => {
    if (!store.get(shouldContinueAiChatInSidePanelState.atom)) {
      return;
    }

    store.set(shouldContinueAiChatInSidePanelState.atom, false);
    store.set(shouldOpenAiChatAfterOnboardingState.atom, false);
    store.set(aiChatExpandedReturnLocationState.atom, null);

    openAskAiPage({ resetNavigationStack: true });

    if (shouldReduceMotion !== true) {
      setIsSidePanelEnteringAtFullWidth(true);
    }
  }, [store, openAskAiPage, shouldReduceMotion]);

  useEffect(() => {
    if (!isSidePanelEnteringAtFullWidth) {
      return;
    }

    let secondFrameId: number | undefined;

    const firstFrameId = requestAnimationFrame(() => {
      secondFrameId = requestAnimationFrame(() => {
        setIsSidePanelEnteringAtFullWidth(false);
      });
    });

    return () => {
      cancelAnimationFrame(firstFrameId);

      if (isDefined(secondFrameId)) {
        cancelAnimationFrame(secondFrameId);
      }
    };
  }, [isSidePanelEnteringAtFullWidth]);

  return { isSidePanelEnteringAtFullWidth };
};
