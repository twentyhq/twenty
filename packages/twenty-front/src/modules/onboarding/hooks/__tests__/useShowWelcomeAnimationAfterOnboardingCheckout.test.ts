import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { createElement } from 'react';

import { currentUserState } from '@/auth/states/currentUserState';
import { useShowWelcomeAnimationAfterOnboardingCheckout } from '@/onboarding/hooks/useShowWelcomeAnimationAfterOnboardingCheckout';
import { isOnboardingCheckoutPendingState } from '@/onboarding/states/isOnboardingCheckoutPendingState';
import { isWelcomeAnimationVisibleState } from '@/onboarding/states/isWelcomeAnimationVisibleState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

import { OnboardingStatus } from '~/generated-metadata/graphql';
import { mockedUserData } from '~/testing/mock-data/users';

const Wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(JotaiProvider, { store: jotaiStore }, children);

const renderAndShow = ({
  isOnboardingCheckoutPending,
  onboardingStatus,
}: {
  isOnboardingCheckoutPending: boolean;
  onboardingStatus: OnboardingStatus;
}) => {
  jotaiStore.set(currentUserState.atom, {
    ...mockedUserData,
    onboardingStatus,
  });
  jotaiStore.set(
    isOnboardingCheckoutPendingState.atom,
    isOnboardingCheckoutPending,
  );

  const { result } = renderHook(
    () => useShowWelcomeAnimationAfterOnboardingCheckout(),
    { wrapper: Wrapper },
  );

  act(() => {
    result.current();
  });
};

describe('useShowWelcomeAnimationAfterOnboardingCheckout', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it('should show the welcome animation when the onboarding checkout is confirmed', () => {
    renderAndShow({
      isOnboardingCheckoutPending: true,
      onboardingStatus: OnboardingStatus.COMPLETED,
    });

    expect(jotaiStore.get(isWelcomeAnimationVisibleState.atom)).toBe(true);
  });

  it('should not show the welcome animation when no onboarding checkout is pending', () => {
    renderAndShow({
      isOnboardingCheckoutPending: false,
      onboardingStatus: OnboardingStatus.COMPLETED,
    });

    expect(jotaiStore.get(isWelcomeAnimationVisibleState.atom)).toBe(false);
  });

  it('should not show the welcome animation while the onboarding is not completed yet', () => {
    renderAndShow({
      isOnboardingCheckoutPending: true,
      onboardingStatus: OnboardingStatus.PLAN_REQUIRED,
    });

    expect(jotaiStore.get(isWelcomeAnimationVisibleState.atom)).toBe(false);
  });

  it('should consume the pending onboarding checkout so it cannot replay', () => {
    renderAndShow({
      isOnboardingCheckoutPending: true,
      onboardingStatus: OnboardingStatus.COMPLETED,
    });

    expect(jotaiStore.get(isOnboardingCheckoutPendingState.atom)).toBe(false);

    jotaiStore.set(isWelcomeAnimationVisibleState.atom, false);

    const { result } = renderHook(
      () => useShowWelcomeAnimationAfterOnboardingCheckout(),
      { wrapper: Wrapper },
    );

    act(() => {
      result.current();
    });

    expect(jotaiStore.get(isWelcomeAnimationVisibleState.atom)).toBe(false);
  });
});
