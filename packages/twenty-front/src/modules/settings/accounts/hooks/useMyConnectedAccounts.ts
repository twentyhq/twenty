import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';
import { useMyCalendarChannels } from '@/settings/accounts/hooks/useMyCalendarChannels';
import { useMyMessageChannels } from '@/settings/accounts/hooks/useMyMessageChannels';
import { useApolloClient, useQuery } from '@apollo/client/react';
import { useMemo } from 'react';
import { ConnectedAccountProvider } from 'twenty-shared/types';

type CoreConnectedAccount = Omit<
  ConnectedAccount,
  'messageChannels' | 'calendarChannels'
>;

// Returns the user's email/calendar connected accounts. App-managed OAuth
// connections (`provider = 'app'`) are excluded — they're surfaced under
// each app's settings tab via `useMyAppConnectedAccounts` instead, so they
// don't pollute the personal accounts page.
export const useMyConnectedAccounts = () => {
  const apolloClient = useApolloClient();

  const { data, loading: accountsLoading } = useQuery<{
    myConnectedAccounts: CoreConnectedAccount[];
  }>(GET_MY_CONNECTED_ACCOUNTS, {
    client: apolloClient,
  });

  const { channels: messageChannels, loading: messageChannelsLoading } =
    useMyMessageChannels();
  const { channels: calendarChannels, loading: calendarChannelsLoading } =
    useMyCalendarChannels();

  const accounts = useMemo<ConnectedAccount[]>(() => {
    if (!data?.myConnectedAccounts) {
      return [];
    }

    return data.myConnectedAccounts
      .filter((account) => account.provider !== ConnectedAccountProvider.APP)
      .map((account) => ({
        ...account,
        messageChannels: messageChannels.filter(
          (channel) => channel.connectedAccountId === account.id,
        ),
        calendarChannels: calendarChannels.filter(
          (channel) => channel.connectedAccountId === account.id,
        ),
      }));
  }, [data, messageChannels, calendarChannels]);

  return {
    accounts,
    loading:
      accountsLoading || messageChannelsLoading || calendarChannelsLoading,
  };
};
