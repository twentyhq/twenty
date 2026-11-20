import { useStore } from 'jotai';
import { useCallback } from 'react';

import { useProjectAiChatThreadToUrl } from '@/ai-chat/hooks/useProjectAiChatThreadToUrl';
import { getCurrentAiChatPageThreadId } from '@/ai-chat/utils/getCurrentAiChatPageThreadId';
import { shouldOpenAiChatAfterOnboardingState } from '@/ai-chat/states/shouldOpenAiChatAfterOnboardingState';

export const useSelectAiChatThread = () => {
  const store = useStore();
  const { projectAiChatThreadToUrl } = useProjectAiChatThreadToUrl();

  const selectAiChatThread = useCallback(
    (toThreadId: string) => {
      if (getCurrentAiChatPageThreadId(store) !== toThreadId) {
        store.set(shouldOpenAiChatAfterOnboardingState.atom, false);
      }

      projectAiChatThreadToUrl(toThreadId);
    },
    [store, projectAiChatThreadToUrl],
  );

  return { selectAiChatThread };
};
