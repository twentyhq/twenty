import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { createElement, type ReactNode } from 'react';
import { AppPath } from 'twenty-shared/types';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { useCompleteBookCallOnboardingStep } from '@/onboarding/hooks/useCompleteBookCallOnboardingStep';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { CompleteBookCallOnboardingStepDocument } from '~/generated-metadata/graphql';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockSetNextOnboardingStatus = jest.fn();

jest.mock('@/onboarding/hooks/useSetNextOnboardingStatus', () => ({
  useSetNextOnboardingStatus: () => mockSetNextOnboardingStatus,
}));

const mutationMock = {
  request: { query: CompleteBookCallOnboardingStepDocument },
  result: {
    data: {
      completeBookCallOnboardingStep: {
        __typename: 'OnboardingStepSuccess',
        success: true,
      },
    },
  },
};

const renderCompleteHook = ({
  isBillingEnabled,
  withSubscription,
}: {
  isBillingEnabled: boolean;
  withSubscription: boolean;
}) => {
  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    billingSubscriptions: withSubscription
      ? mockCurrentWorkspace.billingSubscriptions
      : [],
  });
  jotaiStore.set(billingState.atom, {
    __typename: 'Billing',
    isBillingEnabled,
    trialPeriods: [],
  } as never);

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(
      MockedProvider,
      { mocks: [mutationMock] as never },
      createElement(JotaiProvider, { store: jotaiStore }, children),
    );

  return renderHook(() => useCompleteBookCallOnboardingStep(), { wrapper });
};

describe('useCompleteBookCallOnboardingStep', () => {
  beforeEach(() => {
    resetJotaiStore();
    jest.clearAllMocks();
  });

  it('should navigate to the plan step when a plan is still required', async () => {
    const { result } = renderCompleteHook({
      isBillingEnabled: true,
      withSubscription: false,
    });

    await act(async () => {
      await result.current();
    });

    expect(mockSetNextOnboardingStatus).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(AppPath.PlanRequired);
  });

  it.each([
    { isBillingEnabled: false, withSubscription: false },
    { isBillingEnabled: true, withSubscription: true },
  ])(
    'should leave routing to the redirect engine when no plan is required (%o)',
    async (options) => {
      const { result } = renderCompleteHook(options);

      await act(async () => {
        await result.current();
      });

      expect(mockSetNextOnboardingStatus).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    },
  );
});
