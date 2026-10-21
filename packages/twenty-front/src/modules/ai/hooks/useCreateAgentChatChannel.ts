import { useCallback } from 'react';

import { useRunAgentChatChannelMutation } from '@/ai/hooks/useRunAgentChatChannelMutation';
import { CreateAgentChatChannelDocument } from '~/generated-metadata/graphql';

export const useCreateAgentChatChannel = () => {
  const { runAgentChatChannelMutation } = useRunAgentChatChannelMutation();

  const createAgentChatChannel = useCallback(
    async (name: string) =>
      (
        await runAgentChatChannelMutation({
          mutation: CreateAgentChatChannelDocument,
          variables: { input: { name } },
        })
      )?.createAgentChatChannel.id,
    [runAgentChatChannelMutation],
  );

  return { createAgentChatChannel };
};
