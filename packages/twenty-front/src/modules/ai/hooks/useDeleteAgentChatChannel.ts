import { useCallback } from 'react';

import { useRunInboxChannelMutation } from '@/ai/hooks/useRunAgentChatChannelMutation';
import { DeleteAgentChatChannelDocument } from '~/generated-metadata/graphql';

export const useDeleteInboxChannel = () => {
  const { runInboxChannelMutation } = useRunInboxChannelMutation();

  const deleteAgentChatChannel = useCallback(
    ({
      channelId,
      destinationChannelId,
    }: {
      channelId: string;
      destinationChannelId: string | null;
    }) =>
      runInboxChannelMutation({
        mutation: DeleteAgentChatChannelDocument,
        variables: { channelId, destinationChannelId },
      }),
    [runInboxChannelMutation],
  );

  return { deleteAgentChatChannel };
};
