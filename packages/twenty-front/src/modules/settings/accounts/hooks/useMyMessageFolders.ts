import { type MessageFolder } from '@/accounts/types/MessageFolder';
import { GET_MY_MESSAGE_FOLDERS } from '@/settings/accounts/graphql/queries/getMyMessageFolders';
import { useApolloClient, useQuery } from '@apollo/client/react';

export const useMyMessageFolders = (messageChannelId?: string) => {
  const apolloClient = useApolloClient();

  const { data, loading } = useQuery<{
    myMessageFolders: MessageFolder[];
  }>(GET_MY_MESSAGE_FOLDERS, {
    client: apolloClient,
    variables: messageChannelId ? { messageChannelId } : undefined,
  });

  return {
    messageFolders: data?.myMessageFolders ?? [],
    loading,
  };
};
