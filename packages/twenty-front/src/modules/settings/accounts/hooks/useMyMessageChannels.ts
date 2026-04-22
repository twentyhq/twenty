import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { GET_MY_MESSAGE_CHANNELS } from '@/settings/accounts/graphql/queries/getMyMessageChannels';
import { useApolloClient, useQuery } from '@apollo/client/react';

export const useMyMessageChannels = () => {
  const apolloClient = useApolloClient();

  const { data, loading } = useQuery<{
    myMessageChannels: MessageChannel[];
  }>(GET_MY_MESSAGE_CHANNELS, {
    client: apolloClient,
  });

  return {
    channels: data?.myMessageChannels ?? [],
    loading,
  };
};
