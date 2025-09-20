import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';

import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import {
  SubscriptionStatus,
  WorkspaceActivationStatus,
} from '~/generated/graphql';

const currentWorkspace = {
  id: '1',
  currentBillingSubscription: { status: SubscriptionStatus.Incomplete },
  activationStatus: WorkspaceActivationStatus.ACTIVE,
  allowImpersonation: true,
} as CurrentWorkspace;

const renderHooks = () => {
  const { result } = renderHook(
    () => {
      const subscriptionStatus = useSubscriptionStatus();
      const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);

      return {
        subscriptionStatus,
        setCurrentWorkspace,
      };
    },
    {
      wrapper: RecoilRoot,
    },
  );
  return { result };
};

describe('useSubscriptionStatus', () => {
  Object.values(SubscriptionStatus).forEach((subscriptionStatus) => {
    it(`should return "${subscriptionStatus}"`, async () => {
      const { result } = renderHooks();
      const { setCurrentWorkspace } = result.current;

      act(() => {
        setCurrentWorkspace({
          ...currentWorkspace,
          currentBillingSubscription: {
            id: v4(),
            status: subscriptionStatus,
            metadata: {},
            phases: [],
          },
        });
      });

      expect(result.current.subscriptionStatus).toBe(subscriptionStatus);
    });
  });
});
