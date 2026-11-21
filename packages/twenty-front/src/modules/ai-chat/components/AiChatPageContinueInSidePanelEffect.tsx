import { useStore } from 'jotai';
import { useEffect } from 'react';
import { useIsMobile } from 'twenty-ui/utilities';

import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { aiChatThreadReplyIsSendingFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyIsSendingFamilyState';
import { shouldOpenAiChatAfterOnboardingState } from '@/ai-chat/states/shouldOpenAiChatAfterOnboardingState';
import { isAiChatHandoffSkipped } from '@/ai-chat/utils/isAiChatHandoffSkipped';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { isAiChatPath } from '~/utils/isAiChatPath';
import { isInboxPath } from '~/utils/isInboxPath';
import { isSettingsPath } from '~/utils/isSettingsPath';

type AiChatPageContinueInSidePanelEffectProps = {
  threadId: string;
};

export const AiChatPageContinueInSidePanelEffect = ({
  threadId,
}: AiChatPageContinueInSidePanelEffectProps) => {
  const store = useStore();
  const isMobile = useIsMobile();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();

  useEffect(
    () => () => {
      const { pathname } = window.location;

      if (
        isMobile ||
        isAiChatPath(pathname) ||
        isInboxPath(pathname) ||
        isAiChatHandoffSkipped()
      ) {
        return;
      }

      store.set(shouldOpenAiChatAfterOnboardingState.atom, false);

      if (isSettingsPath(pathname)) {
        return;
      }

      const isIdleNewChat =
        threadId === store.get(newAiChatThreadIdState.atom) &&
        !store.get(
          aiChatThreadReplyIsSendingFamilyState.atomFamily({ threadId }),
        );

      openAskAiPage({
        threadId: isIdleNewChat ? undefined : threadId,
        resetNavigationStack: true,
        isContinuedFromFullWidth: true,
      });
    },
    [isMobile, openAskAiPage, store, threadId],
  );

  return null;
};
