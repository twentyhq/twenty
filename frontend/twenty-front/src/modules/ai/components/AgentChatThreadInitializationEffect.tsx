import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { CHAT_THREADS_PAGE_SIZE } from '@/ai/constants/ChatThreads';
import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { agentChatThreadsLoadingState } from '@/ai/states/agentChatThreadsLoadingState';
import { agentChatUsageState } from '@/ai/states/agentChatUsageState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { currentAIChatThreadTitleState } from '@/ai/states/currentAIChatThreadTitleState';
import { hasTriggeredCreateForDraftState } from '@/ai/states/hasTriggeredCreateForDraftState';
import { useQueryWithCallbacks } from '@/apollo/hooks/useQueryWithCallbacks';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import {
  type GetChatThreadsQuery,
  GetChatThreadsDocument,
} from '~/generated-metadata/graphql';

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

  const handleFirstLoad = useCallback(
    (data: GetChatThreadsQuery) => {
      const threads = data.chatThreads.edges.map((edge) => edge.node);

      if (threads.length > 0) {
        const firstThread = threads[0];
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
    },
    [
      setCurrentAIChatThread,
      setAgentChatInput,
      setCurrentAIChatThreadTitle,
      setAgentChatUsage,
      store,
    ],
  );

  const handleLoadingChange = useCallback(
    (loading: boolean) => {
      setAgentChatThreadsLoading(loading);
    },
    [setAgentChatThreadsLoading],
  );

  useQueryWithCallbacks(GetChatThreadsDocument, {
    variables: { paging: { first: CHAT_THREADS_PAGE_SIZE } },
    skip: isDefined(currentAIChatThread),
    onFirstLoad: handleFirstLoad,
    onLoadingChange: handleLoadingChange,
  });

  return null;
};
