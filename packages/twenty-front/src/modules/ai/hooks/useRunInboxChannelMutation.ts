import { type TypedDocumentNode } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';
import { useToast } from 'twenty-ui/components/feedback';

import { useRefreshInboxChannels } from '@/ai/hooks/useRefreshInboxChannels';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';

export const useRunInboxChannelMutation = () => {
  const client = useApolloClient();
  const { enqueueToast } = useToast();
  const { refreshInboxChannels } = useRefreshInboxChannels();

  const runInboxChannelMutation = useCallback(
    async <TData, TVariables extends Record<string, unknown>>({
      mutation,
      variables,
    }: {
      mutation: TypedDocumentNode<TData, TVariables>;
      variables: TVariables;
    }) => {
      try {
        const { data } = await client.mutate({ mutation, variables });

        await refreshInboxChannels();

        return data ?? undefined;
      } catch (error) {
        enqueueToast(getToastOptionsFromError({ error }));

        return undefined;
      }
    },
    [client, enqueueToast, refreshInboxChannels],
  );

  return { runInboxChannelMutation };
};
