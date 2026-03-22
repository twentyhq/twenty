import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';
import { useMyCalendarChannels } from '@/settings/accounts/hooks/useMyCalendarChannels';
import { useMyMessageChannels } from '@/settings/accounts/hooks/useMyMessageChannels';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { useApolloClient, useQuery } from '@apollo/client/react';
import { useMemo } from 'react';
import { CoreObjectNameSingular, FeatureFlagKey } from 'twenty-shared/types';

type MetadataConnectedAccount = {
  id: string;
  handle: string;
  provider: string;
  authFailedAt: string | null;
  scopes: string[] | null;
  handleAliases: string[] | null;
  lastSignedInAt: string | null;
  userWorkspaceId: string;
  createdAt: string;
  updatedAt: string;
};

export const useMyConnectedAccounts = () => {
  const featureFlagsMap = useFeatureFlagsMap();
  const isMigrated =
    featureFlagsMap[FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED] ?? false;

  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const apolloClient = useApolloClient();

  const { recordGqlFields } = useGenerateDepthRecordGqlFieldsFromObject({
    objectNameSingular: CoreObjectNameSingular.ConnectedAccount,
    depth: 1,
    shouldOnlyLoadRelationIdentifiers: false,
  });

  const { records: workspaceAccounts, loading: workspaceLoading } =
    useFindManyRecords<ConnectedAccount>({
      objectNameSingular: CoreObjectNameSingular.ConnectedAccount,
      filter: {
        accountOwnerId: {
          eq: currentWorkspaceMember?.id,
        },
      },
      recordGqlFields,
      skip: isMigrated,
    });

  const { data: metadataData, loading: metadataLoading } = useQuery<{
    myConnectedAccounts: MetadataConnectedAccount[];
  }>(GET_MY_CONNECTED_ACCOUNTS, {
    client: apolloClient,
    skip: !isMigrated,
  });

  const { channels: messageChannels, loading: messageChannelsLoading } =
    useMyMessageChannels();
  const { channels: calendarChannels, loading: calendarChannelsLoading } =
    useMyCalendarChannels();

  const accounts = useMemo<ConnectedAccount[]>(() => {
    if (!isMigrated) {
      return workspaceAccounts;
    }

    if (!metadataData?.myConnectedAccounts) {
      return [];
    }

    return metadataData.myConnectedAccounts
      .map(
        (account: MetadataConnectedAccount) =>
          ({
            id: account.id,
            handle: account.handle,
            provider: account.provider,
            accessToken: '',
            refreshToken: '',
            accountOwnerId: account.userWorkspaceId,
            lastSyncHistoryId: '',
            authFailedAt: account.authFailedAt
              ? new Date(account.authFailedAt)
              : null,
            messageChannels: messageChannels.filter(
              (channel) =>
                'connectedAccountId' in channel &&
                channel.connectedAccountId === account.id,
            ),
            calendarChannels: calendarChannels.filter(
              (channel) =>
                'connectedAccountId' in channel &&
                channel.connectedAccountId === account.id,
            ),
            scopes: account.scopes,
            __typename: 'ConnectedAccount',
          }) as ConnectedAccount,
      )
      .filter(
        (account) =>
          account.messageChannels.length > 0 ||
          account.calendarChannels.length > 0,
      );
  }, [
    isMigrated,
    workspaceAccounts,
    metadataData,
    messageChannels,
    calendarChannels,
  ]);

  return {
    accounts,
    loading: isMigrated
      ? metadataLoading || messageChannelsLoading || calendarChannelsLoading
      : workspaceLoading,
  };
};
