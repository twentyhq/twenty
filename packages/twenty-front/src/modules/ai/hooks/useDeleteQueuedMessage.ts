import { isDefined } from 'twenty-shared/utils';
import { type AiChatThreadEventDetail } from '@/ai/types/AiChatThreadEventDetail';
import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';

import { AI_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AiChatRefetchMessagesEventName';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { DeleteQueuedChatMessageDocument } from '~/generated-metadata/graphql';

export const useDeleteQueuedMessage = ({
  threadId,
}: {
  threadId: string | null;
}) => {
  const apolloClient = useApolloClient();

  const deleteQueuedMessage = useCallback(
    async (messageId: string) => {
      const { data } = await apolloClient.mutate({
        mutation: DeleteQueuedChatMessageDocument,
        variables: { messageId },
      });

      if (data?.deleteQueuedChatMessage && isDefined(threadId)) {
        dispatchBrowserEvent<AiChatThreadEventDetail>(
          AI_CHAT_REFETCH_MESSAGES_EVENT_NAME,
          { threadId },
        );
      }
    },
    [apolloClient, threadId],
  );

  return { deleteQueuedMessage };
};
