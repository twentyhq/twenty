import { useApolloClient } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useCallback, useState } from 'react';
import { useToast } from 'twenty-ui/components/feedback';

import { useApplyOptimisticAiChatThreadUpdate } from '@/ai-chat/threads/hooks/useApplyOptimisticAiChatThreadUpdate';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { AddAgentChatThreadParticipantsDocument } from '~/generated-metadata/graphql';

export const useAddParticipantsToAiChatThread = () => {
  const { t } = useLingui();
  const apolloClient = useApolloClient();
  const store = useStore();
  const { enqueueToast } = useToast();
  const { applyOptimisticAiChatThreadUpdate } =
    useApplyOptimisticAiChatThreadUpdate();
  const [isAdding, setIsAdding] = useState(false);

  const addParticipantsToAiChatThread = useCallback(
    async ({
      threadId,
      workspaceMemberIds,
    }: {
      threadId: string;
      workspaceMemberIds: string[];
    }): Promise<boolean> => {
      const writerWorkspaceMemberIds =
        store.get(aiChatThreadRecordFamilySelector.selectorFamily(threadId))
          ?.writerWorkspaceMemberIds ?? [];
      const applyWriters = (addedWorkspaceMemberIds: string[]) =>
        applyOptimisticAiChatThreadUpdate({
          id: threadId,
          writerWorkspaceMemberIds: [
            ...new Set([
              ...writerWorkspaceMemberIds,
              ...addedWorkspaceMemberIds,
            ]),
          ],
        });
      const { rollback } = applyWriters(workspaceMemberIds);

      setIsAdding(true);

      try {
        const { data } = await apolloClient.mutate({
          mutation: AddAgentChatThreadParticipantsDocument,
          variables: { input: { threadId, workspaceMemberIds } },
        });
        const addedWorkspaceMemberIds =
          data?.addAgentChatThreadParticipants ?? [];

        if (addedWorkspaceMemberIds.length < workspaceMemberIds.length) {
          rollback();
          applyWriters(addedWorkspaceMemberIds);
          enqueueToast({
            status: 'warning',
            children: t`Some members could not be added.`,
          });
        }

        return true;
      } catch (error) {
        rollback();
        enqueueToast(getToastOptionsFromError({ error }));

        return false;
      } finally {
        setIsAdding(false);
      }
    },
    [apolloClient, applyOptimisticAiChatThreadUpdate, enqueueToast, store, t],
  );

  return { addParticipantsToAiChatThread, isAdding };
};
