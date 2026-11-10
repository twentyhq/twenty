import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const useGettingStartedMailboxAccounts = () => {
  const { accounts, hasLoaded } = useMyConnectedAccounts();

  return {
    accounts: accounts.filter(
      (account) =>
        !isDefined(account.archivedAt) &&
        (isNonEmptyArray(account.messageChannels) ||
          isNonEmptyArray(account.calendarChannels)),
    ),
    hasLoaded,
  };
};
