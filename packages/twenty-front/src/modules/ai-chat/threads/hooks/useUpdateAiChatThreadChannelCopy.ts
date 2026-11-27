import { type TypedDocumentNode } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { useApplyOptimisticAiChatThreadUpdate } from '@/ai-chat/threads/hooks/useApplyOptimisticAiChatThreadUpdate';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';

type InboxThreadChannelCopy = Pick<
  AiChatThreadRecord,
  'channelArchivedAt' | 'channelSnoozedUntil'
>;

export const useUpdateAiChatThreadChannelCopy = () => {
  const client = useApolloClient();
  const store = useStore();
  const { enqueueToast } = useToast();
  const { applyOptimisticAiChatThreadUpdate } =
    useApplyOptimisticAiChatThreadUpdate();

  const updateAiChatThreadChannelCopy = useCallback(
    async <TVariables extends { threadId: string }>({
      mutation,
      variables,
      optimisticChannelCopy,
    }: {
      mutation: TypedDocumentNode<unknown, TVariables>;
      variables: TVariables;
      optimisticChannelCopy: InboxThreadChannelCopy;
    }) => {
      const { threadId } = variables;
      if (
        !isDefined(
          store.get(aiChatThreadRecordFamilySelector.selectorFamily(threadId)),
        )
      ) {
        return;
      }

      const { rollback } = applyOptimisticAiChatThreadUpdate({
        id: threadId,
        ...optimisticChannelCopy,
      });

      try {
        await client.mutate({ mutation, variables });
      } catch (error) {
        enqueueToast(getToastOptionsFromError({ error }));
        rollback();
      }
    },
    [applyOptimisticAiChatThreadUpdate, client, enqueueToast, store],
  );

  return { updateAiChatThreadChannelCopy };
};
