import { useCallback } from 'react';

import { useUpdateAiChatThreadChannelCopy } from '@/ai/hooks/useUpdateAiChatThreadChannelCopy';
import { MarkAgentChatThreadAsDoneInChannelDocument } from '~/generated-metadata/graphql';

export const useMarkAiChatThreadAsDoneInChannel = () => {
  const { updateAiChatThreadChannelCopy } = useUpdateAiChatThreadChannelCopy();

  const markAgentChatThreadAsDoneInChannel = useCallback(
    (threadId: string) =>
      updateAiChatThreadChannelCopy({
        mutation: MarkAgentChatThreadAsDoneInChannelDocument,
        variables: { threadId },
        optimisticChannelCopy: {
          channelArchivedAt: new Date().toISOString(),
          channelSnoozedUntil: null,
        },
      }),
    [updateAiChatThreadChannelCopy],
  );

  return { markAgentChatThreadAsDoneInChannel };
};
