import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { useToast } from 'twenty-ui/components/feedback';

import { useApplyInboxThreadUpdate } from '@/ai/hooks/useApplyInboxThreadUpdate';
import { inboxThreadRecordFamilySelector } from '@/ai/states/selectors/inboxThreadRecordFamilySelector';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { AssignAgentChatThreadDocument } from '~/generated-metadata/graphql';

export const useAssignInboxThreads = () => {
  const apolloClient = useApolloClient();
  const store = useStore();
  const { enqueueToast } = useToast();
  const { applyInboxThreadUpdate } = useApplyInboxThreadUpdate();

  // The assignee shows right away, and is put back if the server refuses it
  const assignInboxThreads = useCallback(
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
            store.get(inboxThreadRecordFamilySelector.selectorFamily(threadId))
              ?.assigneeId ?? null;

          applyInboxThreadUpdate({
            id: threadId,
            assigneeId: assigneeWorkspaceMemberId,
          });

          try {
            await apolloClient.mutate({
              mutation: AssignAgentChatThreadDocument,
              variables: { threadId, assigneeWorkspaceMemberId },
            });
          } catch (error) {
            applyInboxThreadUpdate({
              id: threadId,
              assigneeId: previousAssigneeId,
            });
            enqueueToast(getToastOptionsFromError({ error }));
          }
        }),
      );
    },
    [apolloClient, applyInboxThreadUpdate, enqueueToast, store],
  );

  return { assignInboxThreads };
};
