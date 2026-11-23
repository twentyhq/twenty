import { useStore } from 'jotai';
import { useCallback } from 'react';

import { useProjectAiChatThreadToUrl } from '@/ai-chat/hooks/useProjectAiChatThreadToUrl';
import { getCurrentAiChatPageThreadId } from '@/ai-chat/utils/getCurrentAiChatPageThreadId';
import { isWorkspaceSetupChatActiveState } from '@/ai-chat/states/isWorkspaceSetupChatActiveState';

export const useSelectAiChatThread = () => {
  const store = useStore();
  const { projectAiChatThreadToUrl } = useProjectAiChatThreadToUrl();

  const selectAiChatThread = useCallback(
    (toThreadId: string) => {
      if (getCurrentAiChatPageThreadId(store) !== toThreadId) {
        store.set(isWorkspaceSetupChatActiveState.atom, false);
      }

      projectAiChatThreadToUrl(toThreadId);
    },
    [store, projectAiChatThreadToUrl],
  );

  return { selectAiChatThread };
};
