import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';

import { AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { DeleteQueuedChatMessageDocument } from '~/generated-metadata/graphql';

export const useDeleteQueuedMessage = () => {
  const apolloClient = useApolloClient();

  const deleteQueuedMessage = useCallback(
    async (messageId: string) => {
      const { data } = await apolloClient.mutate({
        mutation: DeleteQueuedChatMessageDocument,
        variables: { messageId },
      });

      if (data?.deleteQueuedChatMessage) {
        dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME);
      }
    },
    [apolloClient],
  );

  return { deleteQueuedMessage };
};
