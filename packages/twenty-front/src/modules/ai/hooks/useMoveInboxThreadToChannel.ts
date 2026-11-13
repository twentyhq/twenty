import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { useApplyInboxThreadUpdate } from '@/ai/hooks/useApplyInboxThreadUpdate';
import { useRefreshInboxChannelSummaries } from '@/ai/hooks/useRefreshInboxChannelSummaries';
import { inboxThreadRecordFamilySelector } from '@/ai/states/selectors/inboxThreadRecordFamilySelector';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { MoveAgentChatThreadToChannelDocument } from '~/generated-metadata/graphql';

export const useMoveInboxThreadToChannel = () => {
  const client = useApolloClient();
  const store = useStore();
  const { enqueueToast } = useToast();
  const { applyInboxThreadUpdate } = useApplyInboxThreadUpdate();
  const { refreshInboxChannelSummaries } = useRefreshInboxChannelSummaries();

  const moveAgentChatThreadToChannel = useCallback(
    async ({
      threadId,
      channelId,
    }: {
      threadId: string;
      channelId: string | null;
    }) => {
      const previousThread = store.get(
        inboxThreadRecordFamilySelector.selectorFamily(threadId),
      );

      if (!isDefined(previousThread?.channelId) && !isDefined(channelId)) {
        return;
      }

      applyInboxThreadUpdate({
        id: threadId,
        channelId,
        channelArchivedAt: null,
        channelSnoozedUntil: null,
      });

      try {
        await client.mutate({
          mutation: MoveAgentChatThreadToChannelDocument,
          variables: { threadId, channelId },
        });
        await refreshInboxChannelSummaries();
      } catch (error) {
        enqueueToast(getToastOptionsFromError({ error }));

        if (
          store.get(inboxThreadRecordFamilySelector.selectorFamily(threadId))
            ?.channelId === channelId
        ) {
          applyInboxThreadUpdate({
            id: threadId,
            channelId: previousThread?.channelId ?? null,
            channelArchivedAt: previousThread?.channelArchivedAt ?? null,
            channelSnoozedUntil: previousThread?.channelSnoozedUntil ?? null,
          });
        }
      }
    },
    [
      applyInboxThreadUpdate,
      client,
      enqueueToast,
      refreshInboxChannelSummaries,
      store,
    ],
  );

  return { moveAgentChatThreadToChannel };
};
