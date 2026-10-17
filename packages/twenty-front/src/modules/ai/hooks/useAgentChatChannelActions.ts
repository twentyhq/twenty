import { type TypedDocumentNode } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';
import { useToast } from 'twenty-ui/components/feedback';

import { useRefreshAgentChatChannels } from '@/ai/hooks/useRefreshAgentChatChannels';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import {
  CreateAgentChatChannelDocument,
  DeleteAgentChatChannelDocument,
  UpdateAgentChatChannelDocument,
  type UpdateAgentChatChannelInput,
} from '~/generated-metadata/graphql';

export const useAgentChatChannelActions = () => {
  const client = useApolloClient();
  const { enqueueToast } = useToast();
  const { refreshAgentChatChannels } = useRefreshAgentChatChannels();

  const runChannelMutation = useCallback(
    async <TData, TVariables extends Record<string, unknown>>(
      mutation: TypedDocumentNode<TData, TVariables>,
      variables: TVariables,
    ) => {
      try {
        const { data } = await client.mutate({ mutation, variables });

        await refreshAgentChatChannels();

        return data ?? undefined;
      } catch (error) {
        enqueueToast(getToastOptionsFromError({ error }));

        return undefined;
      }
    },
    [client, enqueueToast, refreshAgentChatChannels],
  );

  const createAgentChatChannel = useCallback(
    async (name: string) =>
      (
        await runChannelMutation(CreateAgentChatChannelDocument, {
          input: { name },
        })
      )?.createAgentChatChannel.id,
    [runChannelMutation],
  );

  const updateAgentChatChannel = useCallback(
    ({
      channelId,
      input,
    }: {
      channelId: string;
      input: UpdateAgentChatChannelInput;
    }) =>
      runChannelMutation(UpdateAgentChatChannelDocument, { channelId, input }),
    [runChannelMutation],
  );

  const deleteAgentChatChannel = useCallback(
    ({
      channelId,
      destinationChannelId,
    }: {
      channelId: string;
      destinationChannelId: string | null;
    }) =>
      runChannelMutation(DeleteAgentChatChannelDocument, {
        channelId,
        destinationChannelId,
      }),
    [runChannelMutation],
  );

  return {
    createAgentChatChannel,
    updateAgentChatChannel,
    deleteAgentChatChannel,
  };
};
