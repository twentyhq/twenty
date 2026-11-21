import { useStore } from 'jotai';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

import { aiChatPageHandoffThreadIdState } from '@/ai-chat/states/aiChatPageHandoffThreadIdState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { aiChatThreadReplyIsSendingFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyIsSendingFamilyState';
import { shouldOpenAiChatAfterOnboardingState } from '@/ai-chat/states/shouldOpenAiChatAfterOnboardingState';
import { isAiChatHandoffSkipped } from '@/ai-chat/utils/isAiChatHandoffSkipped';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isAiChatPath } from '~/utils/isAiChatPath';
import { isInboxPath } from '~/utils/isInboxPath';
import { isSettingsPath } from '~/utils/isSettingsPath';

export const AiChatPageHandoffEffect = () => {
  const store = useStore();
  const { pathname, state } = useLocation();
  const isMobile = useIsMobile();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();
  const aiChatPageHandoffThreadId = useAtomStateValue(
    aiChatPageHandoffThreadIdState,
  );

  useEffect(() => {
    if (!isDefined(aiChatPageHandoffThreadId)) {
      return;
    }

    store.set(aiChatPageHandoffThreadIdState.atom, null);

    if (
      isMobile ||
      isAiChatPath(pathname) ||
      isInboxPath(pathname) ||
      isAiChatHandoffSkipped(state)
    ) {
      return;
    }

    store.set(shouldOpenAiChatAfterOnboardingState.atom, false);

    if (isSettingsPath(pathname)) {
      return;
    }

    const isIdleNewChat =
      aiChatPageHandoffThreadId === store.get(newAiChatThreadIdState.atom) &&
      !store.get(
        aiChatThreadReplyIsSendingFamilyState.atomFamily({
          threadId: aiChatPageHandoffThreadId,
        }),
      );

    openAskAiPage({
      threadId: isIdleNewChat ? undefined : aiChatPageHandoffThreadId,
      resetNavigationStack: true,
      isContinuedFromFullWidth: true,
    });
  }, [
    aiChatPageHandoffThreadId,
    isMobile,
    openAskAiPage,
    pathname,
    state,
    store,
  ]);

  return null;
};
