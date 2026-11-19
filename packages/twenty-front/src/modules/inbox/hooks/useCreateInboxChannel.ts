import { useCallback } from 'react';

import { useRunInboxChannelMutation } from '@/inbox/hooks/useRunInboxChannelMutation';
import { CreateAgentChatChannelDocument } from '~/generated-metadata/graphql';

export const useCreateInboxChannel = () => {
  const { runInboxChannelMutation } = useRunInboxChannelMutation();

  const createAgentChatChannel = useCallback(
    async (name: string) =>
      (
        await runInboxChannelMutation({
          mutation: CreateAgentChatChannelDocument,
          variables: { input: { name } },
        })
      )?.createAgentChatChannel.id,
    [runInboxChannelMutation],
  );

  return { createAgentChatChannel };
};
