import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { useRefreshAgentChatChannels } from '@/ai/hooks/useRefreshAgentChatChannels';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { MoveAgentChatThreadToChannelDocument } from '~/generated-metadata/graphql';

// The chat shows in its new channel right away, and goes back if the server
// refuses the move
export const useMoveAgentChatThreadToChannel = () => {
  const client = useApolloClient();
  const store = useStore();
  const { enqueueToast } = useToast();
  const { applyAgentChatThreadUpdate } = useApplyAgentChatThreadUpdate();
  const { refreshAgentChatChannels } = useRefreshAgentChatChannels();

  const moveAgentChatThreadToChannel = useCallback(
    async (threadId: string, channelId: string | null) => {
      const previousChannelId = store.get(
        agentChatThreadRecordFamilySelector.selectorFamily(threadId),
      )?.channelId;

      if (!isDefined(previousChannelId) && !isDefined(channelId)) {
        return;
      }

      applyAgentChatThreadUpdate({ id: threadId, channelId });

      try {
        await client.mutate({
          mutation: MoveAgentChatThreadToChannelDocument,
          variables: { threadId, channelId },
        });
        await refreshAgentChatChannels();
      } catch (error) {
        enqueueToast(getToastOptionsFromError({ error }));

        if (
          store.get(
            agentChatThreadRecordFamilySelector.selectorFamily(threadId),
          )?.channelId === channelId
        ) {
          applyAgentChatThreadUpdate({
            id: threadId,
            channelId: previousChannelId ?? null,
          });
        }
      }
    },
    [
      applyAgentChatThreadUpdate,
      client,
      enqueueToast,
      refreshAgentChatChannels,
      store,
    ],
  );

  return { moveAgentChatThreadToChannel };
};
