import { type MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { currentUserState } from '@/auth/states/currentUserState';
import { useGoBackToPreviousOnboardingStep } from '@/onboarding/hooks/useGoBackToPreviousOnboardingStep';
import { onboardingNavigationDirectionState } from '@/onboarding/states/onboardingNavigationDirectionState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import {
  GoBackToPreviousOnboardingStepDocument,
  OnboardingStatus,
} from '~/generated-metadata/graphql';
import { mockedUserData } from '~/testing/mock-data/users';

const buildGoBackMock = ({
  onboardingStatus,
  previousOnboardingStatus,
}: {
  onboardingStatus: OnboardingStatus;
  previousOnboardingStatus: OnboardingStatus | null;
}) => ({
  request: { query: GoBackToPreviousOnboardingStepDocument },
  result: {
    data: {
      goBackToPreviousOnboardingStep: {
        __typename: 'OnboardingStepNavigation',
        onboardingStatus,
        previousOnboardingStatus,
      },
    },
  },
});

const renderGoBackHook = (mocks: readonly MockedResponse[]) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>
      <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
    </MockedProvider>
  );

  return renderHook(() => useGoBackToPreviousOnboardingStep(), { wrapper });
};

describe('useGoBackToPreviousOnboardingStep', () => {
  beforeEach(() => {
    resetJotaiStore();
    localStorage.clear();
    jotaiStore.set(currentUserState.atom, {
      ...mockedUserData,
      onboardingStatus: OnboardingStatus.PROFILE_CREATION,
      previousOnboardingStatus: OnboardingStatus.APPS_INSTALLATION,
    });
  });

  it('should apply the statuses returned by the server and flip the motion direction', async () => {
    const { result } = renderGoBackHook([
      buildGoBackMock({
        onboardingStatus: OnboardingStatus.APPS_INSTALLATION,
        previousOnboardingStatus: OnboardingStatus.SYNC_EMAIL,
      }),
    ]);

    await act(async () => {
      await result.current.goBackToPreviousOnboardingStep();
    });

    const currentUser = jotaiStore.get(currentUserState.atom);

    expect(currentUser?.onboardingStatus).toBe(
      OnboardingStatus.APPS_INSTALLATION,
    );
    expect(currentUser?.previousOnboardingStatus).toBe(
      OnboardingStatus.SYNC_EMAIL,
    );
    expect(jotaiStore.get(onboardingNavigationDirectionState.atom)).toBe(
      'backward',
    );
  });

  it('should clear the previous status when the server reports no earlier step', async () => {
    const { result } = renderGoBackHook([
      buildGoBackMock({
        onboardingStatus: OnboardingStatus.SYNC_EMAIL,
        previousOnboardingStatus: null,
      }),
    ]);

    await act(async () => {
      await result.current.goBackToPreviousOnboardingStep();
    });

    expect(
      jotaiStore.get(currentUserState.atom)?.previousOnboardingStatus,
    ).toBeNull();
  });

  it('should leave the current user untouched when the mutation fails', async () => {
    const { result } = renderGoBackHook([
      {
        request: { query: GoBackToPreviousOnboardingStepDocument },
        result: { errors: [new GraphQLError('No previous onboarding step')] },
      },
    ]);

    await act(async () => {
      await expect(
        result.current.goBackToPreviousOnboardingStep(),
      ).rejects.toThrow();
    });

    expect(jotaiStore.get(currentUserState.atom)?.onboardingStatus).toBe(
      OnboardingStatus.PROFILE_CREATION,
    );
    expect(jotaiStore.get(onboardingNavigationDirectionState.atom)).toBe(
      'forward',
    );
  });
});
