import { GettingStartedConnectedAccountsTable } from '@/getting-started/components/GettingStartedConnectedAccountsTable';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { isDefined } from 'twenty-shared/utils';

export const GettingStartedMailboxDoneAction = () => {
  const { accounts } = useMyConnectedAccounts();
  const activeAccounts = accounts.filter(
    (account) => !isDefined(account.archivedAt),
  );

  if (activeAccounts.length === 0) {
    return null;
  }

  return <GettingStartedConnectedAccountsTable accounts={activeAccounts} />;
};
