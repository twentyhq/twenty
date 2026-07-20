import { render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { createElement } from 'react';

import { currentUserState } from '@/auth/states/currentUserState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { WelcomeAnimationOnCheckoutReturnEffect } from '@/onboarding/effect-components/WelcomeAnimationOnCheckoutReturnEffect';
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

const setUpStore = ({
  isOnboardingCheckoutPending,
  onboardingStatus,
}: {
  isOnboardingCheckoutPending: boolean;
  onboardingStatus: OnboardingStatus;
}) => {
  jotaiStore.set(tokenPairState.atom, {
    accessOrWorkspaceAgnosticToken: { token: 'token', expiresAt: '' },
    refreshToken: { token: 'refreshToken', expiresAt: '' },
  });
  jotaiStore.set(currentUserState.atom, {
    ...mockedUserData,
    onboardingStatus,
  });
  jotaiStore.set(
    isOnboardingCheckoutPendingState.atom,
    isOnboardingCheckoutPending,
  );
};

describe('WelcomeAnimationOnCheckoutReturnEffect', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it('should show the welcome animation when returning from an onboarding checkout', () => {
    setUpStore({
      isOnboardingCheckoutPending: true,
      onboardingStatus: OnboardingStatus.COMPLETED,
    });

    render(<WelcomeAnimationOnCheckoutReturnEffect />, { wrapper: Wrapper });

    expect(jotaiStore.get(isWelcomeAnimationVisibleState.atom)).toBe(true);
  });

  it('should not show the welcome animation when no onboarding checkout is pending', () => {
    setUpStore({
      isOnboardingCheckoutPending: false,
      onboardingStatus: OnboardingStatus.COMPLETED,
    });

    render(<WelcomeAnimationOnCheckoutReturnEffect />, { wrapper: Wrapper });

    expect(jotaiStore.get(isWelcomeAnimationVisibleState.atom)).toBe(false);
  });

  it('should not show the welcome animation while the subscription is not confirmed yet', () => {
    setUpStore({
      isOnboardingCheckoutPending: true,
      onboardingStatus: OnboardingStatus.PLAN_REQUIRED,
    });

    render(<WelcomeAnimationOnCheckoutReturnEffect />, { wrapper: Wrapper });

    expect(jotaiStore.get(isWelcomeAnimationVisibleState.atom)).toBe(false);
  });

  it('should consume the pending checkout so it cannot replay', () => {
    setUpStore({
      isOnboardingCheckoutPending: true,
      onboardingStatus: OnboardingStatus.COMPLETED,
    });

    const { unmount } = render(<WelcomeAnimationOnCheckoutReturnEffect />, {
      wrapper: Wrapper,
    });
    unmount();

    expect(jotaiStore.get(isOnboardingCheckoutPendingState.atom)).toBe(false);

    jotaiStore.set(isWelcomeAnimationVisibleState.atom, false);
    render(<WelcomeAnimationOnCheckoutReturnEffect />, { wrapper: Wrapper });

    expect(jotaiStore.get(isWelcomeAnimationVisibleState.atom)).toBe(false);
  });
});
