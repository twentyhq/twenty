import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { createElement } from 'react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { useIsPlanRequired } from '@/onboarding/hooks/useIsPlanRequired';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const Wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(JotaiProvider, { store: jotaiStore }, children);

type RenderHooksOptions = {
  isBillingEnabled?: boolean;
  withSubscription?: boolean;
};

const renderHooks = ({
  isBillingEnabled = true,
  withSubscription = false,
}: RenderHooksOptions = {}) => {
  const { result } = renderHook(
    () => {
      const setCurrentWorkspace = useSetAtomState(currentWorkspaceState);
      const setBilling = useSetAtomState(billingState);
      const isPlanRequired = useIsPlanRequired();
      return { setCurrentWorkspace, setBilling, isPlanRequired };
    },
    {
      wrapper: Wrapper,
    },
  );

  act(() => {
    result.current.setCurrentWorkspace({
      ...mockCurrentWorkspace,
      billingSubscriptions: withSubscription
        ? mockCurrentWorkspace.billingSubscriptions
        : [],
    });
    result.current.setBilling({
      __typename: 'Billing',
      isBillingEnabled,
      trialPeriods: [],
    });
  });

  return result;
};

describe('useIsPlanRequired', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it('should be true when billing is enabled and the workspace has no subscription', () => {
    const result = renderHooks();

    expect(result.current.isPlanRequired).toBe(true);
  });

  it('should be false when billing is disabled', () => {
    const result = renderHooks({ isBillingEnabled: false });

    expect(result.current.isPlanRequired).toBe(false);
  });

  it('should be false when the workspace already has a subscription', () => {
    const result = renderHooks({ withSubscription: true });

    expect(result.current.isPlanRequired).toBe(false);
  });
});
