import { act, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { Provider as JotaiProvider } from 'jotai';
import { RecoilRoot } from 'recoil';
import { v4 } from 'uuid';

import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import {
  SubscriptionStatus,
  WorkspaceActivationStatus,
} from '~/generated-metadata/graphql';

const currentWorkspace = {
  id: '1',
  currentBillingSubscription: { status: SubscriptionStatus.Incomplete },
  activationStatus: WorkspaceActivationStatus.ACTIVE,
  allowImpersonation: true,
} as CurrentWorkspace;

const Wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(
    JotaiProvider,
    { store: jotaiStore },
    createElement(RecoilRoot, null, children),
  );

const renderHooks = () => {
  const { result } = renderHook(
    () => {
      const subscriptionStatus = useSubscriptionStatus();
      const setCurrentWorkspace = useSetRecoilStateV2(currentWorkspaceState);

      return {
        subscriptionStatus,
        setCurrentWorkspace,
      };
    },
    {
      wrapper: Wrapper,
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
