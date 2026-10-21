import { useCallback } from 'react';

import { useRunAgentChatChannelMutation } from '@/ai/hooks/useRunAgentChatChannelMutation';
import { DeleteAgentChatChannelDocument } from '~/generated-metadata/graphql';

export const useDeleteAgentChatChannel = () => {
  const { runAgentChatChannelMutation } = useRunAgentChatChannelMutation();

  const deleteAgentChatChannel = useCallback(
    ({
      channelId,
      destinationChannelId,
    }: {
      channelId: string;
      destinationChannelId: string | null;
    }) =>
      runAgentChatChannelMutation({
        mutation: DeleteAgentChatChannelDocument,
        variables: { channelId, destinationChannelId },
      }),
    [runAgentChatChannelMutation],
  );

  return { deleteAgentChatChannel };
};
