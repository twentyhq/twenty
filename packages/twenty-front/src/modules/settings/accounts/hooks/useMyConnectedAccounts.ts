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

const EMAIL_CALENDAR_AND_APPLICATION_PROVIDERS: ReadonlySet<ConnectedAccountProvider> =
  new Set([...EMAIL_AND_CALENDAR_PROVIDERS, ConnectedAccountProvider.APP]);

type UseMyConnectedAccountsOptions = {
  // App OAuth connections (provider APP) only belong on the app preferences
  // page: composers, workflow actions and the reconnect banner expect mailboxes.
  includeApplicationAccounts?: boolean;
};

// SSO providers (OIDC, SAML) also live in connectedAccount but are surfaced
// elsewhere, so the list is always filtered to a provider set.
export const useMyConnectedAccounts = ({
  includeApplicationAccounts = false,
}: UseMyConnectedAccountsOptions = {}) => {
  const apolloClient = useApolloClient();

  const providers = includeApplicationAccounts
    ? EMAIL_CALENDAR_AND_APPLICATION_PROVIDERS
    : EMAIL_AND_CALENDAR_PROVIDERS;

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
      .filter((account) => providers.has(account.provider))
      .map((account) => ({
        ...account,
        messageChannels: messageChannels.filter(
          (channel) => channel.connectedAccountId === account.id,
        ),
        calendarChannels: calendarChannels.filter(
          (channel) => channel.connectedAccountId === account.id,
        ),
      }));
  }, [data, messageChannels, calendarChannels, providers]);

  return {
    accounts,
    loading:
      accountsLoading || messageChannelsLoading || calendarChannelsLoading,
  };
};
