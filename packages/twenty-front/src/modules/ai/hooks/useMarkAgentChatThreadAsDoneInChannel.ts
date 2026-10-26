import { useCallback } from 'react';

import { useUpdateAgentChatThreadChannelCopy } from '@/ai/hooks/useUpdateAgentChatThreadChannelCopy';
import { MarkAgentChatThreadAsDoneInChannelDocument } from '~/generated-metadata/graphql';

export const useMarkAgentChatThreadAsDoneInChannel = () => {
  const { updateAgentChatThreadChannelCopy } =
    useUpdateAgentChatThreadChannelCopy();

  const markAgentChatThreadAsDoneInChannel = useCallback(
    (threadId: string) =>
      updateAgentChatThreadChannelCopy({
        mutation: MarkAgentChatThreadAsDoneInChannelDocument,
        variables: { threadId },
        optimisticChannelCopy: {
          channelArchivedAt: new Date().toISOString(),
          channelSnoozedUntil: null,
        },
      }),
    [updateAgentChatThreadChannelCopy],
  );

  return { markAgentChatThreadAsDoneInChannel };
};
