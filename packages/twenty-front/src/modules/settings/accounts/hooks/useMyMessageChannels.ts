import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { GET_MY_MESSAGE_CHANNELS } from '@/settings/accounts/graphql/queries/getMyMessageChannels';
import { useApolloClient, useQuery } from '@apollo/client/react';
import { useMemo } from 'react';

type MetadataMessageChannel = {
  id: string;
  handle: string;
  visibility: string;
  type: string;
  isContactAutoCreationEnabled: boolean;
  contactAutoCreationPolicy: string;
  messageFolderImportPolicy: string;
  excludeNonProfessionalEmails: boolean;
  excludeGroupEmails: boolean;
  isSyncEnabled: boolean;
  syncStatus: string;
  syncStage: string;
  syncStageStartedAt: string | null;
  connectedAccountId: string;
  createdAt: string;
  updatedAt: string;
};

export const useMyMessageChannels = () => {
  const apolloClient = useApolloClient();

  const { data: metadataData, loading: metadataLoading } = useQuery<{
    myMessageChannels: MetadataMessageChannel[];
  }>(GET_MY_MESSAGE_CHANNELS, {
    client: apolloClient,
  });

  const channels = useMemo(() => {
    if (!metadataData?.myMessageChannels) {
      return [];
    }

    return metadataData.myMessageChannels
      .filter(
        (channel: MetadataMessageChannel) =>
          channel.isSyncEnabled &&
          channel.syncStage !== 'PENDING_CONFIGURATION',
      )
      .map(
        (channel: MetadataMessageChannel) =>
          ({
            id: channel.id,
            handle: channel.handle,
            visibility: channel.visibility,
            contactAutoCreationPolicy: channel.contactAutoCreationPolicy,
            excludeNonProfessionalEmails: channel.excludeNonProfessionalEmails,
            excludeGroupEmails: channel.excludeGroupEmails,
            isSyncEnabled: channel.isSyncEnabled,
            messageFolders: [],
            messageFolderImportPolicy: channel.messageFolderImportPolicy,
            syncStatus: channel.syncStatus,
            syncStage: channel.syncStage,
            syncCursor: '',
            syncStageStartedAt: channel.syncStageStartedAt
              ? new Date(channel.syncStageStartedAt)
              : null,
            throttleFailureCount: 0,
            connectedAccountId: channel.connectedAccountId,
            __typename: 'MessageChannel',
          }) as MessageChannel,
      );
  }, [metadataData]);

  return {
    channels,
    loading: metadataLoading,
  };
};
