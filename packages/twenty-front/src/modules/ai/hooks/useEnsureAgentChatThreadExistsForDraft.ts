import { useStore } from 'jotai';
import { useCallback } from 'react';

import { useCreateAgentChatThread } from '@/ai/hooks/useCreateAgentChatThread';
import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { hasTriggeredCreateForDraftState } from '@/ai/states/hasTriggeredCreateForDraftState';
import { tipTapDocumentToMarkdown } from 'twenty-shared/utils';

export const useEnsureAgentChatThreadExistsForDraft = () => {
  const { createChatThread } = useCreateAgentChatThread();
  const store = useStore();

  const ensureThreadExistsForDraft = useCallback(() => {
    const currentThreadId = store.get(currentAiChatThreadState.atom);

    if (currentThreadId !== AGENT_CHAT_NEW_THREAD_DRAFT_KEY) {
      return;
    }

    const draft =
      store.get(agentChatDraftsByThreadIdState.atom)[
        AGENT_CHAT_NEW_THREAD_DRAFT_KEY
      ] ?? '';

    if (
      tipTapDocumentToMarkdown(draft).trim() === '' ||
      store.get(hasTriggeredCreateForDraftState.atom)
    ) {
      return;
    }

    void createChatThread();
  }, [createChatThread, store]);

  return { ensureThreadExistsForDraft };
};
