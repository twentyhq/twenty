import { useAtomValue, useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { agentChatThreadsLoadingState } from '@/ai/states/agentChatThreadsLoadingState';
import { agentChatThreadsSelector } from '@/ai/states/agentChatThreadsSelector';
import { agentChatUsageState } from '@/ai/states/agentChatUsageState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { currentAIChatThreadTitleState } from '@/ai/states/currentAIChatThreadTitleState';
import { hasInitializedAgentChatThreadsState } from '@/ai/states/hasInitializedAgentChatThreadsState';
import { hasTriggeredCreateForDraftState } from '@/ai/states/hasTriggeredCreateForDraftState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const AgentChatThreadInitializationEffect = () => {
  const currentAIChatThread = useAtomStateValue(currentAIChatThreadState);
  const setCurrentAIChatThread = useSetAtomState(currentAIChatThreadState);
  const setAgentChatInput = useSetAtomState(agentChatInputState);
  const setAgentChatUsage = useSetAtomState(agentChatUsageState);
  const setCurrentAIChatThreadTitle = useSetAtomState(
    currentAIChatThreadTitleState,
  );
  const setAgentChatThreadsLoading = useSetAtomState(
    agentChatThreadsLoadingState,
  );
  const store = useStore();
  const agentChatThreads = useAtomStateValue(agentChatThreadsSelector);
  const storeEntry = useAtomValue(
    metadataStoreState.atomFamily('agentChatThreads'),
  );
  const [hasInitializedAgentChatThreads, setHasInitializedAgentChatThreads] =
    useAtomState(hasInitializedAgentChatThreadsState);

  useEffect(() => {
    setAgentChatThreadsLoading(storeEntry.status === 'empty');
  }, [storeEntry.status, setAgentChatThreadsLoading]);

  useEffect(() => {
    if (hasInitializedAgentChatThreads || isDefined(currentAIChatThread)) {
      return;
    }

    if (storeEntry.status === 'empty') {
      return;
    }

    setHasInitializedAgentChatThreads(true);

    const sortedThreads = agentChatThreads.toSorted(
      (a: FlatAgentChatThread, b: FlatAgentChatThread) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

    if (sortedThreads.length > 0) {
      const firstThread = sortedThreads[0];
      const draftForThread =
        store.get(agentChatDraftsByThreadIdState.atom)[firstThread.id] ?? '';

      setCurrentAIChatThread(firstThread.id);
      setAgentChatInput(draftForThread);
      setCurrentAIChatThreadTitle(firstThread.title ?? null);

      const hasUsageData =
        (firstThread.conversationSize ?? 0) > 0 &&
        isDefined(firstThread.contextWindowTokens);

      setAgentChatUsage(
        hasUsageData
          ? {
              lastMessage: null,
              conversationSize: firstThread.conversationSize ?? 0,
              contextWindowTokens: firstThread.contextWindowTokens ?? 0,
              inputTokens: firstThread.totalInputTokens,
              outputTokens: firstThread.totalOutputTokens,
              inputCredits: firstThread.totalInputCredits,
              outputCredits: firstThread.totalOutputCredits,
            }
          : null,
      );
    } else {
      store.set(hasTriggeredCreateForDraftState.atom, false);
      setCurrentAIChatThread(AGENT_CHAT_NEW_THREAD_DRAFT_KEY);
      setAgentChatInput(
        store.get(agentChatDraftsByThreadIdState.atom)[
          AGENT_CHAT_NEW_THREAD_DRAFT_KEY
        ] ?? '',
      );
      setCurrentAIChatThreadTitle(null);
      setAgentChatUsage(null);
    }
  }, [
    agentChatThreads,
    currentAIChatThread,
    hasInitializedAgentChatThreads,
    setHasInitializedAgentChatThreads,
    storeEntry.status,
    setCurrentAIChatThread,
    setAgentChatInput,
    setCurrentAIChatThreadTitle,
    setAgentChatUsage,
    store,
  ]);

  return null;
};
