import { currentUserState } from '@/auth/states/currentUserState';
import { type InformationBannerKeys } from '@/information-banner/types/InformationBannerKeys';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAccountToReconnect = (key: InformationBannerKeys) => {
  const currentUser = useAtomStateValue(currentUserState);

  const userVars = currentUser?.userVars;

  const firstAccountIdToReconnect = userVars?.[key]?.[0];

  const { accounts } = useMyConnectedAccounts();

  const accountToReconnect = accounts.find(
    (account) => account.id === firstAccountIdToReconnect,
  );

  return {
    accountToReconnect,
  };
};
