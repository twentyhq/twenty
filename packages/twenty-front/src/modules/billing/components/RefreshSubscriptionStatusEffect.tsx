import { useEffect } from 'react';
import { useGetCurrentUserLazyQuery } from '~/generated/graphql';
import { sleep } from '~/utils/sleep';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { currentUserState } from '@/auth/states/currentUserState';

export const RefreshSubscriptionStatusEffect = () => {
  // This effect component aims to refresh the billing subscription status in
  // case stripe webhook calls twenty backend after accessing to payment success
  // page
  const subscriptionStatus = useSubscriptionStatus();
  const [getCurrentUser] = useGetCurrentUserLazyQuery();
  const setCurrentUser = useSetRecoilState(currentUserState);

  useEffect(() => {
    const getSubscriptionStatus = async () => {
      let refreshAttempts = 0;
      while (refreshAttempts < 5 && !isDefined(subscriptionStatus)) {
        const result = await getCurrentUser({ fetchPolicy: 'network-only' });
        const currentUser = result.data?.currentUser;
        const refreshedSubscriptionStatus =
          currentUser?.currentWorkspace?.currentBillingSubscription?.status;
        if (
          isDefined(refreshedSubscriptionStatus) &&
          isDefined(currentUser?.currentWorkspace)
        ) {
          setCurrentUser(currentUser);
          break;
        }
        await sleep(1_000);
        refreshAttempts += 1;
      }
    };
    getSubscriptionStatus();
  }, [getCurrentUser, subscriptionStatus, setCurrentUser]);

  return <></>;
};
