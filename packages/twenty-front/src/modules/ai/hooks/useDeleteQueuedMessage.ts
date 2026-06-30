import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';

import { AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { DELETE_QUEUED_CHAT_MESSAGE } from '@/ai/graphql/mutations/deleteQueuedChatMessage';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';

export const useDeleteQueuedMessage = () => {
  const apolloClient = useApolloClient();

  const deleteQueuedMessage = useCallback(
    async (messageId: string) => {
      const { data } = await apolloClient.mutate<{
        deleteQueuedChatMessage: boolean;
      }>({
        mutation: DELETE_QUEUED_CHAT_MESSAGE,
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
