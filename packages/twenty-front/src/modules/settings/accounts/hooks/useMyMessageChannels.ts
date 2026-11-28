import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { GET_MY_MESSAGE_CHANNELS } from '@/settings/accounts/graphql/queries/getMyMessageChannels';
import { useApolloClient, useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

export const useMyMessageChannels = (
  connectedAccountId?: string,
  { skip = false }: { skip?: boolean } = {},
) => {
  const apolloClient = useApolloClient();

  const { data, loading, error, refetch } = useQuery<{
    myMessageChannels: MessageChannel[];
  }>(GET_MY_MESSAGE_CHANNELS, {
    client: apolloClient,
    variables: connectedAccountId ? { connectedAccountId } : undefined,
    skip,
  });

  return {
    channels: data?.myMessageChannels ?? [],
    loading,
    error,
    refetch,
    hasLoaded: isDefined(data),
  };
};
