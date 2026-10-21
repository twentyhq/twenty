import { useCallback } from 'react';

import { useUpdateAgentChatThreadChannelCopy } from '@/ai/hooks/useUpdateAgentChatThreadChannelCopy';
import { ReopenAgentChatThreadInChannelDocument } from '~/generated-metadata/graphql';

export const useReopenAgentChatThreadInChannel = () => {
  const { updateAgentChatThreadChannelCopy } =
    useUpdateAgentChatThreadChannelCopy();

  const reopenAgentChatThreadInChannel = useCallback(
    (threadId: string) =>
      updateAgentChatThreadChannelCopy({
        mutation: ReopenAgentChatThreadInChannelDocument,
        variables: { threadId },
        optimisticChannelCopy: {
          channelArchivedAt: null,
          channelSnoozedUntil: null,
        },
      }),
    [updateAgentChatThreadChannelCopy],
  );

  return { reopenAgentChatThreadInChannel };
};
