import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { useToast } from 'twenty-ui/components/feedback';

import { useApplyAiChatThreadUpdate } from '@/ai/hooks/useApplyAiChatThreadUpdate';
import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/aiChatThreadRecordFamilySelector';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { AssignAgentChatThreadDocument } from '~/generated-metadata/graphql';

export const useAssignAiChatThreads = () => {
  const apolloClient = useApolloClient();
  const store = useStore();
  const { enqueueToast } = useToast();
  const { applyAiChatThreadUpdate } = useApplyAiChatThreadUpdate();

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
          const previousAssigneeId =
            store.get(aiChatThreadRecordFamilySelector.selectorFamily(threadId))
              ?.assigneeId ?? null;

          applyAiChatThreadUpdate({
            id: threadId,
            assigneeId: assigneeWorkspaceMemberId,
          });

          try {
            await apolloClient.mutate({
              mutation: AssignAgentChatThreadDocument,
              variables: { threadId, assigneeWorkspaceMemberId },
            });
          } catch (error) {
            applyAiChatThreadUpdate({
              id: threadId,
              assigneeId: previousAssigneeId,
            });
            enqueueToast(getToastOptionsFromError({ error }));
          }
        }),
      );
    },
    [apolloClient, applyAiChatThreadUpdate, enqueueToast, store],
  );

  return { assignAiChatThreads };
};
