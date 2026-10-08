import { groupConnectedAccountsByHandle } from '@/settings/accounts/utils/groupConnectedAccountsByHandle';
import { useQuery } from '@apollo/client/react';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { MyConsolidatedConnectedAccountsDocument } from '~/generated-metadata/graphql';

const SUPPORTED_PROVIDERS = new Set<string>([
  ConnectedAccountProvider.GOOGLE,
  ConnectedAccountProvider.MICROSOFT,
  ConnectedAccountProvider.IMAP_SMTP_CALDAV,
  ConnectedAccountProvider.APP,
  ConnectedAccountProvider.EMAIL_GROUP,
]);

export const useConsolidatedConnectedAccounts = () => {
  const { data, previousData, loading, error, refetch } = useQuery(
    MyConsolidatedConnectedAccountsDocument,
  );
  const accounts =
    (data ?? previousData)?.myConnectedAccounts.filter((account) =>
      SUPPORTED_PROVIDERS.has(account.provider),
    ) ?? [];

  return {
    accounts,
    groups: groupConnectedAccountsByHandle(accounts),
    loading: loading && !isDefined(data ?? previousData),
    error,
    refetch,
  };
};
