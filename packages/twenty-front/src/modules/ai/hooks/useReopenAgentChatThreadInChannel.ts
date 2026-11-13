import { useCallback } from 'react';

import { useUpdateInboxThreadChannelCopy } from '@/ai/hooks/useUpdateAgentChatThreadChannelCopy';
import { ReopenAgentChatThreadInChannelDocument } from '~/generated-metadata/graphql';

export const useReopenInboxThreadInChannel = () => {
  const { updateInboxThreadChannelCopy } = useUpdateInboxThreadChannelCopy();

  const reopenAgentChatThreadInChannel = useCallback(
    (threadId: string) =>
      updateInboxThreadChannelCopy({
        mutation: ReopenAgentChatThreadInChannelDocument,
        variables: { threadId },
        optimisticChannelCopy: {
          channelArchivedAt: null,
          channelSnoozedUntil: null,
        },
      }),
    [updateInboxThreadChannelCopy],
  );

  return { reopenAgentChatThreadInChannel };
};
