import { type TypedDocumentNode } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { useApplyAiChatThreadUpdate } from '@/ai/hooks/useApplyAiChatThreadUpdate';
import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/aiChatThreadRecordFamilySelector';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';

type InboxThreadChannelCopy = Pick<
  AiChatThreadRecord,
  'channelArchivedAt' | 'channelSnoozedUntil'
>;

export const useUpdateInboxThreadChannelCopy = () => {
  const client = useApolloClient();
  const store = useStore();
  const { enqueueToast } = useToast();
  const { applyAiChatThreadUpdate } = useApplyAiChatThreadUpdate();

  const updateInboxThreadChannelCopy = useCallback(
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
      const getThread = () =>
        store.get(aiChatThreadRecordFamilySelector.selectorFamily(threadId));
      const previousThread = getThread();

      if (!isDefined(previousThread)) {
        return;
      }

      applyAiChatThreadUpdate({ id: threadId, ...optimisticChannelCopy });

      try {
        await client.mutate({ mutation, variables });
      } catch (error) {
        enqueueToast(getToastOptionsFromError({ error }));

        // A newer copy may have arrived since, and is kept
        const currentThread = getThread();

        if (
          currentThread?.channelArchivedAt ===
            optimisticChannelCopy.channelArchivedAt &&
          currentThread?.channelSnoozedUntil ===
            optimisticChannelCopy.channelSnoozedUntil
        ) {
          applyAiChatThreadUpdate({
            id: threadId,
            channelArchivedAt: previousThread.channelArchivedAt ?? null,
            channelSnoozedUntil: previousThread.channelSnoozedUntil ?? null,
          });
        }
      }
    },
    [applyAiChatThreadUpdate, client, enqueueToast, store],
  );

  return { updateInboxThreadChannelCopy };
};
