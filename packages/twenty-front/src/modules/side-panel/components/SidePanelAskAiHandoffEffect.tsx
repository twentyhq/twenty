import { useStore } from 'jotai';
import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { shouldContinueAiChatInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { isAiChatPath } from '~/utils/isAiChatPath';

type SidePanelAskAiHandoffEffectProps = {
  onContinueChatFromFullWidth: () => void;
};

// Consumes the chat page's continuation marker on the navigation that
// leaves it: the conversation reopens in the side panel, shrinking from the
// full width it occupied. A layout effect reads the marker before the chat
// page's unmount cleanup resets it.
export const SidePanelAskAiHandoffEffect = ({
  onContinueChatFromFullWidth,
}: SidePanelAskAiHandoffEffectProps) => {
  const store = useStore();
  const { pathname } = useLocation();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();

  useLayoutEffect(() => {
    if (isAiChatPath(pathname)) {
      return;
    }

    if (!store.get(shouldContinueAiChatInSidePanelState.atom)) {
      return;
    }

    store.set(shouldContinueAiChatInSidePanelState.atom, false);
    store.set(shouldOpenAiChatAfterOnboardingState.atom, false);

    onContinueChatFromFullWidth();
    openAskAiPage({ resetNavigationStack: true });
  }, [pathname, store, openAskAiPage, onContinueChatFromFullWidth]);

  return null;
};
