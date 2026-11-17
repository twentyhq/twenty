import { dispatchAiChatRefetchMessagesEvent } from '@/ai/utils/dispatchAiChatRefetchMessagesEvent';
import { isDefined } from 'twenty-shared/utils';
import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';

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
        dispatchAiChatRefetchMessagesEvent(threadId);
      }
    },
    [apolloClient, threadId],
  );

  return { deleteQueuedMessage };
};
