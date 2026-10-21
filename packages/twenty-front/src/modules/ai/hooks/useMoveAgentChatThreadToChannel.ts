import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { useRefreshAgentChatChannelSummaries } from '@/ai/hooks/useRefreshAgentChatChannelSummaries';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { MoveAgentChatThreadToChannelDocument } from '~/generated-metadata/graphql';

export const useMoveAgentChatThreadToChannel = () => {
  const client = useApolloClient();
  const store = useStore();
  const { enqueueToast } = useToast();
  const { applyAgentChatThreadUpdate } = useApplyAgentChatThreadUpdate();
  const { refreshAgentChatChannelSummaries } =
    useRefreshAgentChatChannelSummaries();

  const moveAgentChatThreadToChannel = useCallback(
    async ({
      threadId,
      channelId,
    }: {
      threadId: string;
      channelId: string | null;
    }) => {
      const previousThread = store.get(
        agentChatThreadRecordFamilySelector.selectorFamily(threadId),
      );

      if (!isDefined(previousThread?.channelId) && !isDefined(channelId)) {
        return;
      }

      applyAgentChatThreadUpdate({
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
        await refreshAgentChatChannelSummaries();
      } catch (error) {
        enqueueToast(getToastOptionsFromError({ error }));

        if (
          store.get(
            agentChatThreadRecordFamilySelector.selectorFamily(threadId),
          )?.channelId === channelId
        ) {
          applyAgentChatThreadUpdate({
            id: threadId,
            channelId: previousThread?.channelId ?? null,
            channelArchivedAt: previousThread?.channelArchivedAt ?? null,
            channelSnoozedUntil: previousThread?.channelSnoozedUntil ?? null,
          });
        }
      }
    },
    [
      applyAgentChatThreadUpdate,
      client,
      enqueueToast,
      refreshAgentChatChannelSummaries,
      store,
    ],
  );

  return { moveAgentChatThreadToChannel };
};
