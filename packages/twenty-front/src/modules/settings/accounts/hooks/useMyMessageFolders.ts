import { type MessageFolder } from '@/accounts/types/MessageFolder';
import { GET_MY_MESSAGE_FOLDERS } from '@/settings/accounts/graphql/queries/getMyMessageFolders';
import { useApolloClient, useQuery } from '@apollo/client/react';
import { useMemo } from 'react';

type MetadataMessageFolder = {
  id: string;
  name: string | null;
  isSynced: boolean;
  isSentFolder: boolean;
  parentFolderId: string | null;
  externalId: string | null;
  messageChannelId: string;
  createdAt: string;
  updatedAt: string;
};

export const useMyMessageFolders = (messageChannelId?: string) => {
  const apolloClient = useApolloClient();

  const { data: metadataData, loading: metadataLoading } = useQuery<{
    myMessageFolders: MetadataMessageFolder[];
  }>(GET_MY_MESSAGE_FOLDERS, {
    client: apolloClient,
    variables: messageChannelId ? { messageChannelId } : undefined,
  });

  const messageFolders = useMemo<MessageFolder[]>(() => {
    if (!metadataData?.myMessageFolders) {
      return [];
    }

    return metadataData.myMessageFolders.map(
      (folder: MetadataMessageFolder) => ({
        id: folder.id,
        name: folder.name ?? '',
        syncCursor: '',
        isSynced: folder.isSynced,
        isSentFolder: folder.isSentFolder,
        parentFolderId: folder.parentFolderId,
        messageChannelId: folder.messageChannelId,
        externalId: folder.externalId,
        __typename: 'MessageFolder' as const,
      }),
    );
  }, [metadataData]);

  return {
    messageFolders,
    loading: metadataLoading,
  };
};
