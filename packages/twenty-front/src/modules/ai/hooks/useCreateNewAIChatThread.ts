import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { useApolloClient } from '@apollo/client';
import { useStore } from 'jotai';

import { CHAT_THREADS_PAGE_SIZE } from '@/ai/constants/ChatThreads';
import { agentChatUsageState } from '@/ai/states/agentChatUsageState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { currentAIChatThreadTitleState } from '@/ai/states/currentAIChatThreadTitleState';
import { useOpenAskAIPageInSidePanel } from '@/side-panel/hooks/useOpenAskAIPageInSidePanel';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { isDefined } from 'twenty-shared/utils';

import {
  type GetChatThreadsQuery,
  GetChatThreadsDocument,
  useCreateChatThreadMutation,
} from '~/generated-metadata/graphql';

export const useCreateNewAIChatThread = () => {
  const [currentAIChatThread, setCurrentAIChatThread] = useAtomState(
    currentAIChatThreadState,
  );
  const setAgentChatInput = useSetAtomState(agentChatInputState);
  const apolloClient = useApolloClient();
  const setAgentChatUsage = useSetAtomState(agentChatUsageState);
  const setCurrentAIChatThreadTitle = useSetAtomState(
    currentAIChatThreadTitleState,
  );
  const setAgentChatDraftsByThreadId = useSetAtomState(
    agentChatDraftsByThreadIdState,
  );
  const store = useStore();

  const { openAskAIPage } = useOpenAskAIPageInSidePanel();
  const [createChatThread] = useCreateChatThreadMutation({
    onCompleted: (data) => {
      const newThreadId = data.createChatThread.id;
      const previousDraftKey =
        currentAIChatThread ?? AGENT_CHAT_NEW_THREAD_DRAFT_KEY;
      const newDraft =
        store.get(agentChatDraftsByThreadIdState.atom)[
          AGENT_CHAT_NEW_THREAD_DRAFT_KEY
        ] ?? '';

      setAgentChatDraftsByThreadId((prev) => ({
        ...prev,
        [previousDraftKey]: store.get(agentChatInputState.atom),
      }));
      setCurrentAIChatThread(newThreadId);
      setAgentChatInput(newDraft);
      setCurrentAIChatThreadTitle(null);
      setAgentChatUsage(null);

      openAskAIPage({ resetNavigationStack: false });

      const newThread = data.createChatThread;
      const threadListVariables = {
        paging: { first: CHAT_THREADS_PAGE_SIZE },
      };
      const existing = apolloClient.cache.readQuery<GetChatThreadsQuery>({
        query: GetChatThreadsDocument,
        variables: threadListVariables,
      });
      if (isDefined(existing) && isDefined(existing.chatThreads)) {
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
              ...existing.chatThreads,
              edges: [newEdge, ...existing.chatThreads.edges],
            },
          },
        });
      }
    },
  });

  const switchToNewChat = () => {
    const previousDraftKey =
      currentAIChatThread ?? AGENT_CHAT_NEW_THREAD_DRAFT_KEY;
    setAgentChatDraftsByThreadId((prev) => ({
      ...prev,
      [previousDraftKey]: store.get(agentChatInputState.atom),
    }));
    setCurrentAIChatThread(AGENT_CHAT_NEW_THREAD_DRAFT_KEY);
    setAgentChatInput(
      store.get(agentChatDraftsByThreadIdState.atom)[
        AGENT_CHAT_NEW_THREAD_DRAFT_KEY
      ] ?? '',
    );
    setCurrentAIChatThreadTitle(null);
    setAgentChatUsage(null);
    openAskAIPage({ resetNavigationStack: false });
  };

  return { createChatThread, switchToNewChat };
};
