import { type TypedDocumentNode } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { useApplyInboxThreadUpdate } from '@/ai/hooks/useApplyInboxThreadUpdate';
import { inboxThreadRecordFamilySelector } from '@/ai/states/selectors/inboxThreadRecordFamilySelector';
import { type InboxThreadRecord } from '@/ai/types/InboxThreadRecord';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';

type InboxThreadChannelCopy = Pick<
  InboxThreadRecord,
  'channelArchivedAt' | 'channelSnoozedUntil'
>;

export const useUpdateInboxThreadChannelCopy = () => {
  const client = useApolloClient();
  const store = useStore();
  const { enqueueToast } = useToast();
  const { applyInboxThreadUpdate } = useApplyInboxThreadUpdate();

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
        store.get(inboxThreadRecordFamilySelector.selectorFamily(threadId));
      const previousThread = getThread();

      if (!isDefined(previousThread)) {
        return;
      }

      applyInboxThreadUpdate({ id: threadId, ...optimisticChannelCopy });

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
          applyInboxThreadUpdate({
            id: threadId,
            channelArchivedAt: previousThread.channelArchivedAt ?? null,
            channelSnoozedUntil: previousThread.channelSnoozedUntil ?? null,
          });
        }
      }
    },
    [applyInboxThreadUpdate, client, enqueueToast, store],
  );

  return { updateInboxThreadChannelCopy };
};
