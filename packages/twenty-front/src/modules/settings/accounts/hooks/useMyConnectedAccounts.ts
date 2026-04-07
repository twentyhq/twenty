import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';
import { useMyCalendarChannels } from '@/settings/accounts/hooks/useMyCalendarChannels';
import { useMyMessageChannels } from '@/settings/accounts/hooks/useMyMessageChannels';
import { useApolloClient, useQuery } from '@apollo/client/react';
import { useMemo } from 'react';

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
  const apolloClient = useApolloClient();

  const { data: metadataData, loading: metadataLoading } = useQuery<{
    myConnectedAccounts: MetadataConnectedAccount[];
  }>(GET_MY_CONNECTED_ACCOUNTS, {
    client: apolloClient,
  });

  const { channels: messageChannels, loading: messageChannelsLoading } =
    useMyMessageChannels();
  const { channels: calendarChannels, loading: calendarChannelsLoading } =
    useMyCalendarChannels();

  const accounts = useMemo<ConnectedAccount[]>(() => {
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
  }, [metadataData, messageChannels, calendarChannels]);

  return {
    accounts,
    loading:
      metadataLoading || messageChannelsLoading || calendarChannelsLoading,
  };
};
