import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';
import { useToast } from 'twenty-ui/components/feedback';

import { useApplyOptimisticAiChatThreadUpdate } from '@/ai-chat/threads/hooks/useApplyOptimisticAiChatThreadUpdate';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { AssignAgentChatThreadDocument } from '~/generated-metadata/graphql';

export const useAssignAiChatThreads = () => {
  const apolloClient = useApolloClient();
  const { enqueueToast } = useToast();
  const { applyOptimisticAiChatThreadUpdate } =
    useApplyOptimisticAiChatThreadUpdate();

  // The assignee shows right away, and is put back if the server refuses it
  const assignAiChatThreads = useCallback(
    async ({
      threadIds,
      assigneeWorkspaceMemberId,
    }: {
      threadIds: string[];
      assigneeWorkspaceMemberId: string | null;
    }) => {
      await Promise.all(
        threadIds.map(async (threadId) => {
          const { rollback } = applyOptimisticAiChatThreadUpdate({
            id: threadId,
            assigneeId: assigneeWorkspaceMemberId,
          });

          try {
            await apolloClient.mutate({
              mutation: AssignAgentChatThreadDocument,
              variables: { threadId, assigneeWorkspaceMemberId },
            });
          } catch (error) {
            rollback();
            enqueueToast(getToastOptionsFromError({ error }));
          }
        }),
      );
    },
    [apolloClient, applyOptimisticAiChatThreadUpdate, enqueueToast],
  );

  return { assignAiChatThreads };
};
