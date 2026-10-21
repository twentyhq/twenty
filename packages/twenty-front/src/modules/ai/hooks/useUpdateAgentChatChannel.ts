import { useCallback } from 'react';

import { useRunAgentChatChannelMutation } from '@/ai/hooks/useRunAgentChatChannelMutation';
import {
  UpdateAgentChatChannelDocument,
  type UpdateAgentChatChannelInput,
} from '~/generated-metadata/graphql';

export const useUpdateAgentChatChannel = () => {
  const { runAgentChatChannelMutation } = useRunAgentChatChannelMutation();

  const updateAgentChatChannel = useCallback(
    ({
      channelId,
      input,
    }: {
      channelId: string;
      input: UpdateAgentChatChannelInput;
    }) =>
      runAgentChatChannelMutation({
        mutation: UpdateAgentChatChannelDocument,
        variables: { channelId, input },
      }),
    [runAgentChatChannelMutation],
  );

  return { updateAgentChatChannel };
};
