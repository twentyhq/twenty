import { useApolloClient } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { CHAT_THREADS_PAGE_SIZE } from '@/ai/constants/ChatThreads';
import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { agentChatUsageState } from '@/ai/states/agentChatUsageState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { currentAIChatThreadTitleState } from '@/ai/states/currentAIChatThreadTitleState';
import { focusEditorAfterMigrateState } from '@/ai/states/focusEditorAfterMigrateState';
import { hasTriggeredCreateForDraftState } from '@/ai/states/hasTriggeredCreateForDraftState';
import { isCreatingChatThreadState } from '@/ai/states/isCreatingChatThreadState';
import { isCreatingForFirstSendState } from '@/ai/states/isCreatingForFirstSendState';
import { skipMessagesSkeletonUntilLoadedState } from '@/ai/states/skipMessagesSkeletonUntilLoadedState';
import { threadIdCreatedFromDraftState } from '@/ai/states/threadIdCreatedFromDraftState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

import {
  type GetChatThreadsQuery,
  GetChatThreadsDocument,
  useCreateChatThreadMutation,
} from '~/generated-metadata/graphql';

export const useCreateAgentChatThread = () => {
  const setCurrentAIChatThread = useSetAtomState(currentAIChatThreadState);
  const setAgentChatInput = useSetAtomState(agentChatInputState);
  const setAgentChatUsage = useSetAtomState(agentChatUsageState);
  const setCurrentAIChatThreadTitle = useSetAtomState(
    currentAIChatThreadTitleState,
  );
  const [, setIsCreatingChatThread] = useAtomState(isCreatingChatThreadState);
  const setAgentChatDraftsByThreadId = useSetAtomState(
    agentChatDraftsByThreadIdState,
  );
  const store = useStore();
  const apolloClient = useApolloClient();

  const [createChatThread] = useCreateChatThreadMutation({
    onCompleted: (data) => {
      if (store.get(isCreatingForFirstSendState.atom)) {
        store.set(isCreatingForFirstSendState.atom, false);
        setIsCreatingChatThread(false);
        return;
      }

      const newThreadId = data.createChatThread.id;
      const previousDraftKey =
        store.get(currentAIChatThreadState.atom) ??
        AGENT_CHAT_NEW_THREAD_DRAFT_KEY;
      const draftsSnapshot = store.get(agentChatDraftsByThreadIdState.atom);
      const newDraft = draftsSnapshot[AGENT_CHAT_NEW_THREAD_DRAFT_KEY] ?? '';

      setIsCreatingChatThread(false);

      if (previousDraftKey === AGENT_CHAT_NEW_THREAD_DRAFT_KEY) {
        store.set(hasTriggeredCreateForDraftState.atom, true);
        setAgentChatDraftsByThreadId((previousDrafts) => ({
          ...previousDrafts,
          [newThreadId]: newDraft,
          [AGENT_CHAT_NEW_THREAD_DRAFT_KEY]: '',
        }));
        store.set(focusEditorAfterMigrateState.atom, true);
        store.set(skipMessagesSkeletonUntilLoadedState.atom, true);
        store.set(threadIdCreatedFromDraftState.atom, newThreadId);
      } else {
        setAgentChatDraftsByThreadId((previousDrafts) => ({
          ...previousDrafts,
          [previousDraftKey]: store.get(agentChatInputState.atom),
        }));
      }

      setCurrentAIChatThread(newThreadId);
      setAgentChatInput(newDraft);
      setCurrentAIChatThreadTitle(null);
      setAgentChatUsage(null);

      const newThread = data.createChatThread;
      const threadListVariables = {
        paging: { first: CHAT_THREADS_PAGE_SIZE },
      };
      const existingThreadsCache =
        apolloClient.cache.readQuery<GetChatThreadsQuery>({
          query: GetChatThreadsDocument,
          variables: threadListVariables,
        });

      if (
        isDefined(existingThreadsCache) &&
        isDefined(existingThreadsCache.chatThreads)
      ) {
        const newNode = {
          __typename: 'AgentChatThread' as const,
          ...newThread,
          totalInputTokens: 0,
          totalOutputTokens: 0,
          contextWindowTokens: null,
          conversationSize: 0,
          totalInputCredits: 0,
          totalOutputCredits: 0,
        };
        const newEdge = {
          __typename: 'AgentChatThreadEdge' as const,
          node: newNode,
          cursor: newThread.id,
        };
        apolloClient.cache.writeQuery({
          query: GetChatThreadsDocument,
          variables: threadListVariables,
          data: {
            chatThreads: {
              ...existingThreadsCache.chatThreads,
              edges: [newEdge, ...existingThreadsCache.chatThreads.edges],
            },
          },
        });
      }
    },
    onError: () => {
      setIsCreatingChatThread(false);
      store.set(isCreatingForFirstSendState.atom, false);
      store.set(hasTriggeredCreateForDraftState.atom, false);
    },
    refetchQueries: [
      getOperationName(GetChatThreadsDocument) ?? 'GetChatThreads',
    ],
  });

  return { createChatThread };
};
