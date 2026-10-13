import { useQuery } from '@apollo/client/react';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { myConnectedAccountsState } from '@/accounts/states/myConnectedAccountsState';
import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { useIsOnAuthOrOnboardingPage } from '@/auth/hooks/useIsOnAuthOrOnboardingPage';
import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const MyConnectedAccountsLoadEffect = () => {
  const isLogged = useIsLogged();
  const isOnAuthOrOnboardingPage = useIsOnAuthOrOnboardingPage();
  const setMyConnectedAccounts = useSetAtomState(myConnectedAccountsState);

  const { data, error } = useQuery<{
    myConnectedAccounts: Omit<
      ConnectedAccount,
      'messageChannels' | 'calendarChannels'
    >[];
  }>(GET_MY_CONNECTED_ACCOUNTS, {
    skip: !isLogged || isOnAuthOrOnboardingPage,
  });

  useEffect(() => {
    if (isDefined(data?.myConnectedAccounts)) {
      setMyConnectedAccounts(data.myConnectedAccounts);

      return;
    }

    if (isDefined(error)) {
      setMyConnectedAccounts([]);
    }
  }, [data, error, setMyConnectedAccounts]);

  return null;
};
