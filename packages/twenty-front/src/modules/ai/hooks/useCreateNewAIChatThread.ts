import { useApolloClient } from '@apollo/client';

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
  const apolloClient = useApolloClient();
  const [, setCurrentAIChatThread] = useAtomState(currentAIChatThreadState);
  const setAgentChatUsage = useSetAtomState(agentChatUsageState);
  const setCurrentAIChatThreadTitle = useSetAtomState(
    currentAIChatThreadTitleState,
  );

  const { openAskAIPage } = useOpenAskAIPageInSidePanel();
  const [createChatThread] = useCreateChatThreadMutation({
    onCompleted: (data) => {
      setCurrentAIChatThread(data.createChatThread.id);
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

  return { createChatThread };
};
