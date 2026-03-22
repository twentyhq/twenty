import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { isCreatingChatThreadState } from '@/ai/states/isCreatingChatThreadState';
import { isCreatingForFirstSendState } from '@/ai/states/isCreatingForFirstSendState';
import { pendingCreateFromDraftPromiseState } from '@/ai/states/pendingCreateFromDraftPromiseState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useEnsureAgentChatThreadIdForSend = (
  createChatThread: () => Promise<any>,
) => {
  const setIsCreatingChatThread = useSetAtomState(isCreatingChatThreadState);
  const store = useStore();

  const ensureThreadIdForSend = useCallback(async (): Promise<
    string | null
  > => {
    const currentThreadId = store.get(currentAIChatThreadState.atom);

    if (currentThreadId !== AGENT_CHAT_NEW_THREAD_DRAFT_KEY) {
      return currentThreadId;
    }

    const inFlightCreatePromise = store.get(
      pendingCreateFromDraftPromiseState.atom,
    );

    if (
      store.get(isCreatingChatThreadState.atom) &&
      isDefined(inFlightCreatePromise)
    ) {
      try {
        const threadId = await inFlightCreatePromise;
        return threadId;
      } catch {
        return null;
      }
    }

    store.set(isCreatingForFirstSendState.atom, true);
    setIsCreatingChatThread(true);

    try {
      const result = await createChatThread();
      return result?.data?.createChatThread?.id ?? null;
    } catch {
      return null;
    } finally {
      setIsCreatingChatThread(false);
    }
  }, [createChatThread, store, setIsCreatingChatThread]);

  return { ensureThreadIdForSend };
};
