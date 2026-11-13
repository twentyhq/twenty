import { useStore } from 'jotai';
import { useCallback } from 'react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { INBOX_NEW_THREAD_PATH_SEGMENT } from '@/ai/constants/AiChatNewThreadPathSegment';
import { newInboxThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { getCurrentHistoryEntryState } from '~/utils/getCurrentHistoryEntryState';
import { isInboxPath } from '~/utils/isAiChatInboxPath';
import { isCurrentPathInboxThreadPage } from '~/utils/isCurrentPathAiChatPage';
import { isMatchingPathname } from '~/utils/isMatchingPathname';

type UseProjectInboxThreadToUrlParams = {
  shouldPreserveClosedInbox?: boolean;
};

export const useProjectInboxThreadToUrl = ({
  shouldPreserveClosedInbox = false,
}: UseProjectInboxThreadToUrlParams = {}) => {
  const navigateApp = useNavigateApp();
  const store = useStore();

  const projectInboxThreadToUrl = useCallback(
    (threadId: string) => {
      const pathname = window.location.pathname;
      const isOnInboxPage = isInboxPath(pathname);
      const isInboxClosed = isMatchingPathname(
        pathname,
        getAppPath(AppPath.AiChatInbox, { threadId: null }),
      );

      if (shouldPreserveClosedInbox && isInboxClosed) {
        return;
      }

      if (!isCurrentPathInboxThreadPage() && !isOnInboxPage) {
        return;
      }

      const isNewChat = threadId === store.get(newInboxThreadIdState.atom);
      const newThreadPathSegment = isOnInboxPage
        ? INBOX_NEW_THREAD_PATH_SEGMENT
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

  return { projectInboxThreadToUrl };
};
