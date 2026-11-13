import { useCallback } from 'react';

import { useUpdateInboxThreadChannelCopy } from '@/inbox/hooks/useUpdateInboxThreadChannelCopy';
import { SnoozeAgentChatThreadInChannelDocument } from '~/generated-metadata/graphql';

export const useSnoozeInboxThreadsInChannel = () => {
  const { updateInboxThreadChannelCopy } = useUpdateInboxThreadChannelCopy();

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
          updateInboxThreadChannelCopy({
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
    [updateInboxThreadChannelCopy],
  );

  return { snoozeInboxThreadsInChannel };
};
