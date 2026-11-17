import { useStore } from 'jotai';
import { useCallback } from 'react';

import { useProjectAiChatThreadToUrl } from '@/ai/hooks/useProjectAiChatThreadToUrl';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { getAiChatPageThreadId } from '@/ai/utils/getAiChatPageThreadId';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';

export const useSelectAiChatThread = () => {
  const store = useStore();
  const { projectAiChatThreadToUrl } = useProjectAiChatThreadToUrl();

  const selectAiChatThread = useCallback(
    (toThreadId: string) => {
      const aiChatPageThreadId = getAiChatPageThreadId({
        pathname: window.location.pathname,
        newAiChatThreadId: store.get(newAiChatThreadIdState.atom),
      });

      if (aiChatPageThreadId !== toThreadId) {
        store.set(shouldOpenAiChatAfterOnboardingState.atom, false);
      }

      projectAiChatThreadToUrl(toThreadId);
    },
    [store, projectAiChatThreadToUrl],
  );

  return { selectAiChatThread };
};
