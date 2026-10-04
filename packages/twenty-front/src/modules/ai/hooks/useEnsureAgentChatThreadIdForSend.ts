import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useCreateAgentChatThread } from '@/ai/hooks/useCreateAgentChatThread';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { isCreatingForFirstSendState } from '@/ai/states/isCreatingForFirstSendState';
import { pendingAgentChatThreadCreationState } from '@/ai/states/pendingAgentChatThreadCreationState';

export const useEnsureAgentChatThreadIdForSend = () => {
  const { createChatThread } = useCreateAgentChatThread();
  const store = useStore();

  const ensureThreadIdForSend = useCallback(async (): Promise<
    string | null
  > => {
    const currentThreadId = store.get(currentAiChatThreadState.atom);

    if (
      currentThreadId !== null &&
      currentThreadId !== AGENT_CHAT_NEW_THREAD_DRAFT_KEY
    ) {
      return currentThreadId;
    }

    const pendingCreation = store.get(pendingAgentChatThreadCreationState.atom);

    if (isDefined(pendingCreation)) {
      return pendingCreation;
    }

    store.set(isCreatingForFirstSendState.atom, true);

    return createChatThread();
  }, [createChatThread, store]);

  return { ensureThreadIdForSend };
};
