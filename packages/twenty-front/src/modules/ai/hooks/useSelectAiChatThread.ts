import { useStore } from 'jotai';
import { useCallback } from 'react';

import { useProjectAiChatThreadToUrl } from '@/ai/hooks/useProjectAiChatThreadToUrl';
import { getCurrentAiChatPageThreadId } from '@/ai/utils/getCurrentAiChatPageThreadId';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';

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
