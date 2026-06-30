import { useStore } from 'jotai';
import { useCallback } from 'react';

import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { hasTriggeredCreateForDraftState } from '@/ai/states/hasTriggeredCreateForDraftState';
import { isCreatingChatThreadState } from '@/ai/states/isCreatingChatThreadState';
import { pendingCreateFromDraftPromiseState } from '@/ai/states/pendingCreateFromDraftPromiseState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useEnsureAgentChatThreadExistsForDraft = (
  createChatThread: () => Promise<any>,
) => {
  const setIsCreatingChatThread = useSetAtomState(isCreatingChatThreadState);
  const setPendingCreateFromDraftPromise = useSetAtomState(
    pendingCreateFromDraftPromiseState,
  );
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

    if (draft.trim() === '') {
      return;
    }

    if (store.get(hasTriggeredCreateForDraftState.atom)) {
      return;
    }

    if (store.get(isCreatingChatThreadState.atom)) {
      return;
    }

    setIsCreatingChatThread(true);

    const createPromise = createChatThread();
    const threadIdPromise = createPromise.then(
      (result) => result?.data?.createChatThread?.id ?? null,
    );

    setPendingCreateFromDraftPromise(threadIdPromise);

    threadIdPromise.finally(() => {
      setPendingCreateFromDraftPromise(null);
    });
  }, [
    createChatThread,
    setPendingCreateFromDraftPromise,
    store,
    setIsCreatingChatThread,
  ]);

  return { ensureThreadExistsForDraft };
};
