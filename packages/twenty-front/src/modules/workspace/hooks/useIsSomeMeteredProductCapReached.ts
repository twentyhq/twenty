import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { BillingProductKey } from '~/generated/graphql';

export const useIsSomeMeteredProductCapReached = (): boolean => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const meteredProductKeys = Object.values(BillingProductKey).filter(
    (productKey) => productKey !== BillingProductKey.BASE_PRODUCT,
  );

  return meteredProductKeys.some((productKey) => {
    return (
      currentWorkspace?.currentBillingSubscription?.billingSubscriptionItems?.find(
        (item) => item.billingProduct?.metadata.productKey === productKey,
      )?.hasReachedCurrentPeriodCap ?? false
    );
  });
};
