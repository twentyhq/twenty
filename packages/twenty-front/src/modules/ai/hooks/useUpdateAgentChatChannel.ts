import { useCallback } from 'react';

import { useRunInboxChannelMutation } from '@/ai/hooks/useRunAgentChatChannelMutation';
import {
  UpdateAgentChatChannelDocument,
  type UpdateAgentChatChannelInput,
} from '~/generated-metadata/graphql';

export const useUpdateInboxChannel = () => {
  const { runInboxChannelMutation } = useRunInboxChannelMutation();

  const updateAgentChatChannel = useCallback(
    ({
      channelId,
      input,
    }: {
      channelId: string;
      input: UpdateAgentChatChannelInput;
    }) =>
      runInboxChannelMutation({
        mutation: UpdateAgentChatChannelDocument,
        variables: { channelId, input },
      }),
    [runInboxChannelMutation],
  );

  return { updateAgentChatChannel };
};
