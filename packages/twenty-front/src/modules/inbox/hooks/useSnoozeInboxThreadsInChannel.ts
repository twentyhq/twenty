import { useCallback } from 'react';

import { useUpdateAiChatThreadChannelCopy } from '@/ai/hooks/useUpdateAiChatThreadChannelCopy';
import { SnoozeAgentChatThreadInChannelDocument } from '~/generated-metadata/graphql';

export const useSnoozeInboxThreadsInChannel = () => {
  const { updateAiChatThreadChannelCopy } = useUpdateAiChatThreadChannelCopy();

  const snoozeInboxThreadsInChannel = useCallback(
    async ({
      threadIds,
      snoozedUntil,
    }: {
      threadIds: string[];
      snoozedUntil: Date;
    }) => {
      await Promise.all(
        threadIds.map((threadId) =>
          updateAiChatThreadChannelCopy({
            mutation: SnoozeAgentChatThreadInChannelDocument,
            variables: { threadId, snoozedUntil: snoozedUntil.toISOString() },
            optimisticChannelCopy: {
              channelArchivedAt: new Date().toISOString(),
              channelSnoozedUntil: snoozedUntil.toISOString(),
            },
          }),
        ),
      );
    },
    [updateAiChatThreadChannelCopy],
  );

  return { snoozeInboxThreadsInChannel };
};
