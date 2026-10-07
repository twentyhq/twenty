import { type TypedDocumentNode } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';
import { useToast } from 'twenty-ui/components/feedback';

import { useRefreshAgentChatChannels } from '@/ai/hooks/useRefreshAgentChatChannels';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import {
  type AgentChatChannelVisibility,
  CreateAgentChatChannelDocument,
  DeleteAgentChatChannelDocument,
  JoinAgentChatChannelDocument,
  LeaveAgentChatChannelDocument,
  UpdateAgentChatChannelDocument,
} from '~/generated-metadata/graphql';

export const useAgentChatChannelActions = () => {
  const client = useApolloClient();
  const { enqueueToast } = useToast();
  const { refreshAgentChatChannels } = useRefreshAgentChatChannels();

  // Resolves to the result, or undefined once the error is shown
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

  const renameAgentChatChannel = useCallback(
    ({ channelId, name }: { channelId: string; name: string }) =>
      runChannelMutation(UpdateAgentChatChannelDocument, {
        channelId,
        input: { name },
      }),
    [runChannelMutation],
  );

  const setAgentChatChannelVisibility = useCallback(
    ({
      channelId,
      visibility,
    }: {
      channelId: string;
      visibility: AgentChatChannelVisibility;
    }) =>
      runChannelMutation(UpdateAgentChatChannelDocument, {
        channelId,
        input: { visibility },
      }),
    [runChannelMutation],
  );

  const joinAgentChatChannel = useCallback(
    (channelId: string) =>
      runChannelMutation(JoinAgentChatChannelDocument, { channelId }),
    [runChannelMutation],
  );

  const leaveAgentChatChannel = useCallback(
    (channelId: string) =>
      runChannelMutation(LeaveAgentChatChannelDocument, { channelId }),
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
    renameAgentChatChannel,
    setAgentChatChannelVisibility,
    joinAgentChatChannel,
    leaveAgentChatChannel,
    deleteAgentChatChannel,
  };
};
