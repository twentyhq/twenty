import { useStore } from 'jotai';
import { useCallback } from 'react';
import { AppPath } from 'twenty-shared/types';

import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { getCurrentHistoryEntryState } from '~/utils/getCurrentHistoryEntryState';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

export const useProjectAiChatThreadToUrl = () => {
  const navigateApp = useNavigateApp();
  const store = useStore();

  const projectAiChatThreadToUrl = useCallback(
    (threadId: string) => {
      if (!isCurrentPathAiChatPage()) {
        return;
      }

      // The new chat has no thread to open yet, so its URL carries no id
      const isNewChat = threadId === store.get(newAiChatThreadIdState.atom);

      navigateApp(
        AppPath.AiChat,
        { threadId: isNewChat ? null : threadId },
        undefined,
        { replace: true, state: getCurrentHistoryEntryState() },
      );
    },
    [navigateApp, store],
  );

  return { projectAiChatThreadToUrl };
};
