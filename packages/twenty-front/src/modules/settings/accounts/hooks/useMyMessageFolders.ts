import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { type MessageFolder } from '@/accounts/types/MessageFolder';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import { GET_MY_MESSAGE_FOLDERS } from '@/settings/accounts/graphql/queries/getMyMessageFolders';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { useApolloClient, useQuery } from '@apollo/client/react';
import { useMemo } from 'react';
import { CoreObjectNameSingular, FeatureFlagKey } from 'twenty-shared/types';

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
  const featureFlagsMap = useFeatureFlagsMap();
  const isMigrated =
    featureFlagsMap[FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED] ?? false;

  const apolloClient = useApolloClient();

  const { recordGqlFields } = useGenerateDepthRecordGqlFieldsFromObject({
    objectNameSingular: CoreObjectNameSingular.MessageChannel,
    depth: 1,
    shouldOnlyLoadRelationIdentifiers: false,
  });

  const { record: messageChannel, loading: workspaceLoading } =
    useFindOneRecord<MessageChannel>({
      objectNameSingular: CoreObjectNameSingular.MessageChannel,
      objectRecordId: messageChannelId,
      recordGqlFields,
      skip: isMigrated || !messageChannelId,
    });

  const { data: metadataData, loading: metadataLoading } = useQuery<{
    myMessageFolders: MetadataMessageFolder[];
  }>(GET_MY_MESSAGE_FOLDERS, {
    client: apolloClient,
    variables: messageChannelId ? { messageChannelId } : undefined,
    skip: !isMigrated,
  });

  const messageFolders = useMemo<MessageFolder[]>(() => {
    if (!isMigrated) {
      return messageChannel?.messageFolders ?? [];
    }

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
  }, [isMigrated, messageChannel, metadataData]);

  return {
    messageFolders,
    loading: isMigrated ? metadataLoading : workspaceLoading,
  };
};
