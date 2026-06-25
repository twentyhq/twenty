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

const EMAIL_AND_CALENDAR_PROVIDERS: ReadonlySet<ConnectedAccountProvider> =
  new Set([
    ConnectedAccountProvider.GOOGLE,
    ConnectedAccountProvider.MICROSOFT,
    ConnectedAccountProvider.IMAP_SMTP_CALDAV,
  ]);

// The personal accounts page is for email/calendar credentials only. SSO
// providers (OIDC, SAML) and app-managed OAuth (APP) also live in
// connectedAccount, but they're surfaced elsewhere — keep them off this
// page by filtering to the email/calendar provider set.
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
      .filter((account) => EMAIL_AND_CALENDAR_PROVIDERS.has(account.provider))
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
