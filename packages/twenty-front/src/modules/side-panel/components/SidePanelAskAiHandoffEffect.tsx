import { useStore } from 'jotai';
import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { shouldContinueInboxInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';
import { shouldOpenInboxAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { isInboxPath } from '~/utils/isAiChatInboxPath';
import { isInboxThreadPath } from '~/utils/isAiChatPath';
import { isSettingsPath } from '~/utils/isSettingsPath';

type SidePanelAskAiHandoffEffectProps = {
  onContinueChatFromFullWidth: () => void;
};

export const SidePanelAskAiHandoffEffect = ({
  onContinueChatFromFullWidth,
}: SidePanelAskAiHandoffEffectProps) => {
  const store = useStore();
  const { pathname } = useLocation();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();

  useLayoutEffect(() => {
    if (isInboxThreadPath(pathname)) {
      return;
    }

    // The inbox shows its own chat, which keeps the handoff pending; only the
    // onboarding chat ends there
    if (isInboxPath(pathname)) {
      store.set(shouldOpenInboxAfterOnboardingState.atom, false);
      return;
    }

    if (!store.get(shouldContinueInboxInSidePanelState.atom)) {
      return;
    }

    store.set(shouldContinueInboxInSidePanelState.atom, false);
    store.set(shouldOpenInboxAfterOnboardingState.atom, false);

    if (isSettingsPath(pathname)) {
      return;
    }

    onContinueChatFromFullWidth();
    openAskAiPage({ resetNavigationStack: true });
  }, [pathname, store, openAskAiPage, onContinueChatFromFullWidth]);

  return null;
};
