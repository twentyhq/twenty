import { act } from 'react-dom/test-utils';
import { renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';

import {
  CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { billingState } from '@/client-config/states/billingState';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { SubscriptionStatus } from '~/generated/graphql';

const tokenPair = {
  accessToken: { token: 'accessToken', expiresAt: 'expiresAt' },
  refreshToken: { token: 'refreshToken', expiresAt: 'expiresAt' },
};
const currentWorkspace = {
  id: '1',
  currentBillingSubscription: { status: SubscriptionStatus.Incomplete },
  activationStatus: 'active',
  allowImpersonation: true,
} as CurrentWorkspace;

const renderHooks = () => {
  const { result } = renderHook(
    () => {
      const subscriptionStatus = useSubscriptionStatus();
      const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
      const setTokenPair = useSetRecoilState(tokenPairState);
      const setBilling = useSetRecoilState(billingState);

      return {
        subscriptionStatus,
        setCurrentWorkspace,
        setTokenPair,
        setBilling,
      };
    },
    {
      wrapper: RecoilRoot,
    },
  );
  return { result };
};

describe('useSubscriptionStatus', () => {
  it(`should return "undefined" when user is not logged in`, async () => {
    const { result } = renderHooks();
    expect(result.current.subscriptionStatus).toBe(undefined);
  });

  Object.values(SubscriptionStatus).forEach((subscriptionStatus) => {
    it(`should return "active" when billing not enabled`, async () => {
      const { result } = renderHooks();
      const { setTokenPair, setCurrentWorkspace, setBilling } = result.current;
      act(() => {
        setBilling({ isBillingEnabled: false });
        setTokenPair(tokenPair);
        setCurrentWorkspace({
          ...currentWorkspace,
          currentBillingSubscription: {
            id: v4(),
            status: subscriptionStatus,
          },
        });
      });
      expect(result.current.subscriptionStatus).toBe(SubscriptionStatus.Active);
    });
  });

  Object.values(SubscriptionStatus).forEach((subscriptionStatus) => {
    it(`should return "${subscriptionStatus}" when billing enabled`, async () => {
      const { result } = renderHooks();
      const { setTokenPair, setCurrentWorkspace, setBilling } = result.current;

      act(() => {
        setBilling({ isBillingEnabled: true });
        setTokenPair(tokenPair);
        setCurrentWorkspace({
          ...currentWorkspace,
          currentBillingSubscription: {
            id: v4(),
            status: subscriptionStatus,
          },
        });
      });

      expect(result.current.subscriptionStatus).toBe(subscriptionStatus);
    });
  });
});
