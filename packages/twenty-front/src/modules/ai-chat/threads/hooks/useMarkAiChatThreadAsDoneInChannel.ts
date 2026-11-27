import { useCallback } from 'react';

import { useUpdateAiChatThreadChannelCopy } from '@/ai-chat/threads/hooks/useUpdateAiChatThreadChannelCopy';
import { MarkAgentChatThreadAsDoneInChannelDocument } from '~/generated-metadata/graphql';

export const useMarkAiChatThreadAsDoneInChannel = () => {
  const { updateAiChatThreadChannelCopy } = useUpdateAiChatThreadChannelCopy();

  const markAiChatThreadAsDoneInChannel = useCallback(
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

  return { markAiChatThreadAsDoneInChannel };
};
