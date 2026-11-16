import { isGettingStartedMailboxAccount } from '@/getting-started/utils/isGettingStartedMailboxAccount';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';

export const useGettingStartedMailboxAccounts = () => {
  const { accounts, hasLoaded } = useMyConnectedAccounts();

  return {
    accounts: accounts.filter(isGettingStartedMailboxAccount),
    hasLoaded,
  };
};
