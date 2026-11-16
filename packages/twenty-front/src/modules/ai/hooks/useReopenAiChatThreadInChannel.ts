import { useCallback } from 'react';

import { useUpdateAiChatThreadChannelCopy } from '@/ai/hooks/useUpdateAiChatThreadChannelCopy';
import { ReopenAgentChatThreadInChannelDocument } from '~/generated-metadata/graphql';

export const useReopenAiChatThreadInChannel = () => {
  const { updateAiChatThreadChannelCopy } = useUpdateAiChatThreadChannelCopy();

  const reopenAgentChatThreadInChannel = useCallback(
    (threadId: string) =>
      updateAiChatThreadChannelCopy({
        mutation: ReopenAgentChatThreadInChannelDocument,
        variables: { threadId },
        optimisticChannelCopy: {
          channelArchivedAt: null,
          channelSnoozedUntil: null,
        },
      }),
    [updateAiChatThreadChannelCopy],
  );

  return { reopenAgentChatThreadInChannel };
};
