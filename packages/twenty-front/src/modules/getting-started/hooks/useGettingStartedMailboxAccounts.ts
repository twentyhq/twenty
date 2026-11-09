import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

// SSO sign-in also stores a connected account, but without any channel.
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
