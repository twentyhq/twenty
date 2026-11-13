import { useCallback } from 'react';

import { useRunInboxChannelMutation } from '@/inbox/hooks/useRunInboxChannelMutation';
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
