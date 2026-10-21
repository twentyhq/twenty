import { useCallback } from 'react';

import { useUpdateAgentChatThreadChannelCopy } from '@/ai/hooks/useUpdateAgentChatThreadChannelCopy';
import { SnoozeAgentChatThreadInChannelDocument } from '~/generated-metadata/graphql';

export const useSnoozeAgentChatThreadsInChannel = () => {
  const { updateAgentChatThreadChannelCopy } =
    useUpdateAgentChatThreadChannelCopy();

  const snoozeAgentChatThreadsInChannel = useCallback(
    async ({
      threadIds,
      snoozedUntil,
    }: {
      threadIds: string[];
      snoozedUntil: Date;
    }) => {
      await Promise.all(
        threadIds.map((threadId) =>
          updateAgentChatThreadChannelCopy({
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
    [updateAgentChatThreadChannelCopy],
  );

  return { snoozeAgentChatThreadsInChannel };
};
