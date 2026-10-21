import { useStore } from 'jotai';
import { useCallback } from 'react';
import { AppPath } from 'twenty-shared/types';

import { AI_CHAT_NEW_THREAD_PATH_SEGMENT } from '@/ai/constants/AiChatNewThreadPathSegment';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { getCurrentHistoryEntryState } from '~/utils/getCurrentHistoryEntryState';
import { isAiChatInboxPath } from '~/utils/isAiChatInboxPath';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

export const useProjectAiChatThreadToUrl = () => {
  const navigateApp = useNavigateApp();
  const store = useStore();

  const projectAiChatThreadToUrl = useCallback(
    (threadId: string) => {
      const isOnInboxPage = isAiChatInboxPath(window.location.pathname);

      if (!isCurrentPathAiChatPage() && !isOnInboxPage) {
        return;
      }

      const isNewChat = threadId === store.get(newAiChatThreadIdState.atom);
      const newThreadPathSegment = isOnInboxPage
        ? AI_CHAT_NEW_THREAD_PATH_SEGMENT
        : null;

      navigateApp(
        isOnInboxPage ? AppPath.AiChatInbox : AppPath.AiChat,
        {
          threadId: isNewChat ? newThreadPathSegment : threadId,
        },
        undefined,
        { replace: true, state: getCurrentHistoryEntryState() },
      );
    },
    [navigateApp, store],
  );

  return { projectAiChatThreadToUrl };
};
