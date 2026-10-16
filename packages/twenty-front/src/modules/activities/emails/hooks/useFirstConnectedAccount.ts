import { isDefined } from 'twenty-shared/utils';

import { myConnectedAccountsState } from '@/accounts/states/myConnectedAccountsState';
import { findFirstConnectedAccountAbleToSendEmail } from '@/accounts/utils/findFirstConnectedAccountAbleToSendEmail';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useFirstConnectedAccount = () => {
  const myConnectedAccounts = useAtomStateValue(myConnectedAccountsState);

  const firstAccount = findFirstConnectedAccountAbleToSendEmail(
    myConnectedAccounts ?? [],
  );

  return {
    connectedAccountId: firstAccount?.id ?? null,
    connectedAccountHandle: firstAccount?.handle ?? null,
    loading: !isDefined(myConnectedAccounts),
  };
};
