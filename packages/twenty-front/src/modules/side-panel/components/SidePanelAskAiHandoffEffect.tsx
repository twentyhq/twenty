import { useStore } from 'jotai';
import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { aiChatContinueInSidePanelThreadIdState } from '@/ai-chat/states/aiChatContinueInSidePanelThreadIdState';
import { aiChatIsSendingMessageFamilyState } from '@/ai-chat/states/aiChatIsSendingMessageFamilyState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { isInboxPath } from '~/utils/isInboxPath';
import { isAiChatPath } from '~/utils/isAiChatPath';
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
    if (isAiChatPath(pathname) || isInboxPath(pathname)) {
      return;
    }

    const aiChatContinueInSidePanelThreadId = store.get(
      aiChatContinueInSidePanelThreadIdState.atom,
    );

    if (!isDefined(aiChatContinueInSidePanelThreadId)) {
      return;
    }

    store.set(aiChatContinueInSidePanelThreadIdState.atom, null);
    store.set(shouldOpenAiChatAfterOnboardingState.atom, false);

    if (isSettingsPath(pathname)) {
      return;
    }

    const isIdleNewChat =
      aiChatContinueInSidePanelThreadId ===
        store.get(newAiChatThreadIdState.atom) &&
      !store.get(
        aiChatIsSendingMessageFamilyState.atomFamily({
          threadId: aiChatContinueInSidePanelThreadId,
        }),
      );

    onContinueChatFromFullWidth();
    openAskAiPage({
      threadId: isIdleNewChat ? undefined : aiChatContinueInSidePanelThreadId,
      resetNavigationStack: true,
    });
  }, [pathname, store, openAskAiPage, onContinueChatFromFullWidth]);

  return null;
};
