import { useStore } from 'jotai';
import { useCallback } from 'react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { AI_CHAT_NEW_THREAD_PATH_SEGMENT } from '@/ai/constants/AiChatNewThreadPathSegment';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { getCurrentHistoryEntryState } from '~/utils/getCurrentHistoryEntryState';
import { isAiChatInboxPath } from '~/utils/isAiChatInboxPath';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';
import { isMatchingPathname } from '~/utils/isMatchingPathname';

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
      const pathname = window.location.pathname;
      const isOnInboxPage = isAiChatInboxPath(pathname);
      const isInboxClosed = isMatchingPathname(
        pathname,
        getAppPath(AppPath.AiChatInbox, { threadId: null }),
      );

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
