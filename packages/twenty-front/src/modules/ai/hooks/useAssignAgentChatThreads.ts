import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { useToast } from 'twenty-ui/components/feedback';

import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { AssignAgentChatThreadDocument } from '~/generated-metadata/graphql';

export const useAssignAgentChatThreads = () => {
  const apolloClient = useApolloClient();
  const store = useStore();
  const { enqueueToast } = useToast();
  const { applyAgentChatThreadUpdate } = useApplyAgentChatThreadUpdate();

  // The assignee shows right away, and is put back if the server refuses it
  const assignAgentChatThreads = useCallback(
    async ({
      threadIds,
      assigneeWorkspaceMemberId,
    }: {
      threadIds: string[];
      assigneeWorkspaceMemberId: string | null;
    }) => {
      await Promise.all(
        threadIds.map(async (threadId) => {
          const previousAssigneeId =
            store.get(
              agentChatThreadRecordFamilySelector.selectorFamily(threadId),
            )?.assigneeId ?? null;

          applyAgentChatThreadUpdate({
            id: threadId,
            assigneeId: assigneeWorkspaceMemberId,
          });

          try {
            await apolloClient.mutate({
              mutation: AssignAgentChatThreadDocument,
              variables: { threadId, assigneeWorkspaceMemberId },
            });
          } catch (error) {
            applyAgentChatThreadUpdate({
              id: threadId,
              assigneeId: previousAssigneeId,
            });
            enqueueToast(getToastOptionsFromError({ error }));
          }
        }),
      );
    },
    [apolloClient, applyAgentChatThreadUpdate, enqueueToast, store],
  );

  return { assignAgentChatThreads };
};
