import { useStore } from 'jotai';
import { useCallback } from 'react';

import { useSelectAiChatThread } from '@/ai-chat/hooks/useSelectAiChatThread';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { getCurrentAiChatPageThreadId } from '@/ai-chat/utils/getCurrentAiChatPageThreadId';

export const useSelectAiChatThreadFromNewChat = () => {
  const store = useStore();
  const { selectAiChatThread } = useSelectAiChatThread();

  const selectAiChatThreadFromNewChat = useCallback(
    (threadId: string) => {
      const isPageStillOnNewChat =
        getCurrentAiChatPageThreadId(store) ===
        store.get(newAiChatThreadIdState.atom);

      if (isPageStillOnNewChat) {
        selectAiChatThread(threadId);
      }
    },
    [store, selectAiChatThread],
  );

  return { selectAiChatThreadFromNewChat };
};
