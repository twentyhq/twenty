import { useStore } from 'jotai';
import { useCallback } from 'react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { getAiChatPageRoute } from '@/ai-chat/utils/getAiChatPageRoute';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { getCurrentHistoryEntryState } from '~/utils/getCurrentHistoryEntryState';
import { isInboxPath } from '~/utils/isInboxPath';
import { isAiModePath } from '~/utils/isAiModePath';
import { isMatchingPathname } from '~/utils/isMatchingPathname';

export const useProjectAiChatThreadToUrl = () => {
  const navigateApp = useNavigateApp();
  const store = useStore();

  const projectAiChatThreadToUrl = useCallback(
    (threadId: string) => {
      const pathname = window.location.pathname;
      const isOnInboxPage = isInboxPath(pathname);
      const isInboxClosed = isMatchingPathname(
        pathname,
        getAppPath(AppPath.AiChatInbox, { threadId: null }),
      );

      if (!isAiModePath(pathname)) {
        return;
      }

      const isNewChat = threadId === store.get(newAiChatThreadIdState.atom);
      const aiChatPageRoute = getAiChatPageRoute({
        isInbox: isOnInboxPage,
        threadId: isNewChat ? null : threadId,
      });

      navigateApp(
        aiChatPageRoute.appPath,
        { threadId: aiChatPageRoute.threadId },
        undefined,
        { replace: !isInboxClosed, state: getCurrentHistoryEntryState() },
      );
    },
    [navigateApp, store],
  );

  return { projectAiChatThreadToUrl };
};
