import { GettingStartedConnectedAccountsTable } from '@/getting-started/components/GettingStartedConnectedAccountsTable';
import { useGettingStartedMailboxAccounts } from '@/getting-started/hooks/useGettingStartedMailboxAccounts';

export const GettingStartedMailboxDoneAction = () => {
  const { accounts } = useGettingStartedMailboxAccounts();

  if (accounts.length === 0) {
    return null;
  }

  return <GettingStartedConnectedAccountsTable accounts={accounts} />;
};
