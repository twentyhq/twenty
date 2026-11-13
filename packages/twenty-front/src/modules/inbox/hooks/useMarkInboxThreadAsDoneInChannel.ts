import { useCallback } from 'react';

import { useUpdateInboxThreadChannelCopy } from '@/inbox/hooks/useUpdateInboxThreadChannelCopy';
import { MarkAgentChatThreadAsDoneInChannelDocument } from '~/generated-metadata/graphql';

export const useMarkInboxThreadAsDoneInChannel = () => {
  const { updateInboxThreadChannelCopy } = useUpdateInboxThreadChannelCopy();

  const markAgentChatThreadAsDoneInChannel = useCallback(
    (threadId: string) =>
      updateInboxThreadChannelCopy({
        mutation: MarkAgentChatThreadAsDoneInChannelDocument,
        variables: { threadId },
        optimisticChannelCopy: {
          channelArchivedAt: new Date().toISOString(),
          channelSnoozedUntil: null,
        },
      }),
    [updateInboxThreadChannelCopy],
  );

  return { markAgentChatThreadAsDoneInChannel };
};
