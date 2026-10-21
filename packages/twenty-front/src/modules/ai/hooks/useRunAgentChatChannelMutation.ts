import { type TypedDocumentNode } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';
import { useToast } from 'twenty-ui/components/feedback';

import { useRefreshAgentChatChannels } from '@/ai/hooks/useRefreshAgentChatChannels';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';

export const useRunAgentChatChannelMutation = () => {
  const client = useApolloClient();
  const { enqueueToast } = useToast();
  const { refreshAgentChatChannels } = useRefreshAgentChatChannels();

  const runAgentChatChannelMutation = useCallback(
    async <TData, TVariables extends Record<string, unknown>>({
      mutation,
      variables,
    }: {
      mutation: TypedDocumentNode<TData, TVariables>;
      variables: TVariables;
    }) => {
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

  return { runAgentChatChannelMutation };
};
