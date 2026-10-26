import { useStore } from 'jotai';
import { useCallback } from 'react';
import { matchPath } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { AI_CHAT_NEW_THREAD_PATH_SEGMENT } from '@/ai/constants/AiChatNewThreadPathSegment';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { getCurrentHistoryEntryState } from '~/utils/getCurrentHistoryEntryState';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

type UseProjectAiChatThreadToUrlParams = {
  shouldPreserveClosedInbox?: boolean;
};

export const useProjectAiChatThreadToUrl = ({
  shouldPreserveClosedInbox = false,
}: UseProjectAiChatThreadToUrlParams = {}) => {
  const navigateApp = useNavigateApp();
  const store = useStore();

  const projectAiChatThreadToUrl = useCallback(
    (threadId: string) => {
      const inboxRoute = matchPath(
        AppPath.AiChatInbox,
        window.location.pathname,
      );
      const isOnInboxPage = isDefined(inboxRoute);
      const isInboxClosed =
        isOnInboxPage && !isDefined(inboxRoute.params.threadId);

      if (shouldPreserveClosedInbox && isInboxClosed) {
        return;
      }

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
        { replace: !isInboxClosed, state: getCurrentHistoryEntryState() },
      );
    },
    [navigateApp, shouldPreserveClosedInbox, store],
  );

  return { projectAiChatThreadToUrl };
};
