import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { GET_MY_MESSAGE_CHANNELS } from '@/settings/accounts/graphql/queries/getMyMessageChannels';
import { useApolloClient, useQuery } from '@apollo/client/react';

export const useMyMessageChannels = (connectedAccountId?: string) => {
  const apolloClient = useApolloClient();

  const { data, loading } = useQuery<{
    myMessageChannels: MessageChannel[];
  }>(GET_MY_MESSAGE_CHANNELS, {
    client: apolloClient,
    variables: connectedAccountId ? { connectedAccountId } : undefined,
  });

  return {
    channels: data?.myMessageChannels ?? [],
    loading,
  };
};
