import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import {
  type MessageChannel,
  MessageChannelSyncStage,
} from '@/accounts/types/MessageChannel';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import { GET_MY_MESSAGE_CHANNELS } from '@/settings/accounts/graphql/queries/getMyMessageChannels';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { useApolloClient, useQuery } from '@apollo/client/react';
import { useMemo } from 'react';
import { CoreObjectNameSingular, FeatureFlagKey } from 'twenty-shared/types';

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
  const featureFlagsMap = useFeatureFlagsMap();
  const isMigrated =
    featureFlagsMap[FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED] ?? false;

  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const apolloClient = useApolloClient();

  const { records: workspaceAccounts } = useFindManyRecords<ConnectedAccount>({
    objectNameSingular: CoreObjectNameSingular.ConnectedAccount,
    filter: {
      accountOwnerId: {
        eq: currentWorkspaceMember?.id,
      },
    },
    skip: isMigrated,
  });

  const { recordGqlFields } = useGenerateDepthRecordGqlFieldsFromObject({
    objectNameSingular: CoreObjectNameSingular.MessageChannel,
    depth: 1,
  });

  const { records: workspaceChannels, loading: workspaceLoading } =
    useFindManyRecords<MessageChannel & { connectedAccount: ConnectedAccount }>(
      {
        objectNameSingular: CoreObjectNameSingular.MessageChannel,
        filter: {
          connectedAccountId: {
            in: workspaceAccounts.map((account) => account.id),
          },
          isSyncEnabled: { eq: true },
          syncStage: {
            neq: MessageChannelSyncStage.PENDING_CONFIGURATION,
          },
        },
        recordGqlFields,
        skip: isMigrated || !workspaceAccounts.length,
      },
    );

  const { data: metadataData, loading: metadataLoading } = useQuery<{
    myMessageChannels: MetadataMessageChannel[];
  }>(GET_MY_MESSAGE_CHANNELS, {
    client: apolloClient,
    skip: !isMigrated,
  });

  const channels = useMemo(() => {
    if (!isMigrated) {
      return workspaceChannels;
    }

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
  }, [isMigrated, workspaceChannels, metadataData]);

  return {
    channels,
    loading: isMigrated ? metadataLoading : workspaceLoading,
  };
};
