import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { useLoadAgentChatThread } from '@/ai/hooks/useLoadAgentChatThread';
import { OpenDirectMessageDocument } from '~/generated-metadata/graphql';

export const useOpenDirectMessageThreadOrThrow = () => {
  const apolloClient = useApolloClient();
  const { loadAgentChatThread } = useLoadAgentChatThread();

  const openDirectMessageThreadOrThrow = useCallback(
    async (workspaceMemberId: string) => {
      const { data } = await apolloClient.mutate({
        mutation: OpenDirectMessageDocument,
        variables: { workspaceMemberId },
      });
      const threadId = data?.openDirectMessage;
      assertIsDefinedOrThrow(threadId);
      const thread = await loadAgentChatThread(threadId);
      assertIsDefinedOrThrow(thread);

      return thread;
    },
    [apolloClient, loadAgentChatThread],
  );

  return { openDirectMessageThreadOrThrow };
};
