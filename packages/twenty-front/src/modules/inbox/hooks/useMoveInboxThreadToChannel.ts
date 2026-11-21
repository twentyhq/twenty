import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { useApplyOptimisticAiChatThreadUpdate } from '@/ai-chat/threads/hooks/useApplyOptimisticAiChatThreadUpdate';
import { useRefreshInboxChannelSummaries } from '@/inbox/hooks/useRefreshInboxChannelSummaries';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { MoveAgentChatThreadToChannelDocument } from '~/generated-metadata/graphql';

export const useMoveInboxThreadToChannel = () => {
  const client = useApolloClient();
  const store = useStore();
  const { enqueueToast } = useToast();
  const { applyOptimisticAiChatThreadUpdate } =
    useApplyOptimisticAiChatThreadUpdate();
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
        aiChatThreadRecordFamilySelector.selectorFamily(threadId),
      );

      if (!isDefined(previousThread?.channelId) && !isDefined(channelId)) {
        return;
      }

      const { rollback } = applyOptimisticAiChatThreadUpdate({
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
        rollback();
      }
    },
    [
      applyOptimisticAiChatThreadUpdate,
      client,
      enqueueToast,
      refreshInboxChannelSummaries,
      store,
    ],
  );

  return { moveAgentChatThreadToChannel };
};
