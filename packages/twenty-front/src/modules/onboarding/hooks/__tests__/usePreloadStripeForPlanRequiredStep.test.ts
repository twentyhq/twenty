import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { createElement } from 'react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { usePreloadStripeForPlanRequiredStep } from '@/onboarding/hooks/usePreloadStripeForPlanRequiredStep';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

import { loadStripe } from '@stripe/stripe-js/pure';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

jest.mock('@stripe/stripe-js/pure', () => ({
  loadStripe: jest.fn().mockResolvedValue(null),
}));

const loadStripeMock = jest.mocked(loadStripe);

const Wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(JotaiProvider, { store: jotaiStore }, children);

type RenderHooksOptions = {
  isBillingEnabled?: boolean;
  withSubscription?: boolean;
  stripePublishableKey?: string;
};

const renderHooks = ({
  isBillingEnabled = true,
  withSubscription = false,
  stripePublishableKey,
}: RenderHooksOptions = {}) => {
  const { result } = renderHook(
    () => {
      const setCurrentWorkspace = useSetAtomState(currentWorkspaceState);
      const setBilling = useSetAtomState(billingState);
      usePreloadStripeForPlanRequiredStep();
      return { setCurrentWorkspace, setBilling };
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
      stripePublishableKey,
    });
  });
};

describe('usePreloadStripeForPlanRequiredStep', () => {
  beforeEach(() => {
    resetJotaiStore();
    jest.clearAllMocks();
  });

  it('should preload Stripe when billing is enabled and the workspace has no subscription', () => {
    renderHooks({ stripePublishableKey: 'pk_test_preload' });

    expect(loadStripeMock).toHaveBeenCalledTimes(1);
    expect(loadStripeMock).toHaveBeenCalledWith('pk_test_preload');
  });

  it('should not preload Stripe when billing is disabled', () => {
    renderHooks({
      isBillingEnabled: false,
      stripePublishableKey: 'pk_test_billing_disabled',
    });

    expect(loadStripeMock).not.toHaveBeenCalled();
  });

  it('should not preload Stripe when the workspace already has a subscription', () => {
    renderHooks({
      withSubscription: true,
      stripePublishableKey: 'pk_test_with_subscription',
    });

    expect(loadStripeMock).not.toHaveBeenCalled();
  });

  it('should not preload Stripe when the publishable key is missing', () => {
    renderHooks();

    expect(loadStripeMock).not.toHaveBeenCalled();
  });
});
