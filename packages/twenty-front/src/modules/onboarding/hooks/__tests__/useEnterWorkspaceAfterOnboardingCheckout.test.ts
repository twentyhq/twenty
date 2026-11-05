import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { createElement } from 'react';

import { currentUserState } from '@/auth/states/currentUserState';
import { isOnboardingAiChatEnabledState } from '@/client-config/states/isOnboardingAiChatEnabledState';
import { useEnterWorkspaceAfterOnboardingCheckout } from '@/onboarding/hooks/useEnterWorkspaceAfterOnboardingCheckout';
import { isOnboardingCheckoutPendingState } from '@/onboarding/states/isOnboardingCheckoutPendingState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

import { OnboardingStatus } from '~/generated-metadata/graphql';
import { mockedUserData } from '~/testing/mock-data/users';

const Wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(JotaiProvider, { store: jotaiStore }, children);

const enterWorkspace = () => {
  const { result } = renderHook(
    () => useEnterWorkspaceAfterOnboardingCheckout(),
    { wrapper: Wrapper },
  );

  act(() => {
    result.current();
  });
};

const renderAndEnter = ({
  isOnboardingCheckoutPending,
  onboardingStatus,
  isOnboardingAiChatEnabled = true,
}: {
  isOnboardingCheckoutPending: boolean;
  onboardingStatus: OnboardingStatus;
  isOnboardingAiChatEnabled?: boolean;
}) => {
  jotaiStore.set(currentUserState.atom, {
    ...mockedUserData,
    onboardingStatus,
  });
  jotaiStore.set(
    isOnboardingCheckoutPendingState.atom,
    isOnboardingCheckoutPending,
  );
  jotaiStore.set(
    isOnboardingAiChatEnabledState.atom,
    isOnboardingAiChatEnabled,
  );

  enterWorkspace();
};

describe('useEnterWorkspaceAfterOnboardingCheckout', () => {
  beforeEach(() => {
    sessionStorage.clear();
    resetJotaiStore();
  });

  it('should open the setup chat when the onboarding checkout is confirmed', () => {
    renderAndEnter({
      isOnboardingCheckoutPending: true,
      onboardingStatus: OnboardingStatus.COMPLETED,
    });

    expect(jotaiStore.get(shouldOpenAiChatAfterOnboardingState.atom)).toBe(
      true,
    );
  });

  it('should not open the setup chat when the ai chat is disabled', () => {
    renderAndEnter({
      isOnboardingCheckoutPending: true,
      onboardingStatus: OnboardingStatus.COMPLETED,
      isOnboardingAiChatEnabled: false,
    });

    expect(jotaiStore.get(isOnboardingCheckoutPendingState.atom)).toBe(false);
    expect(jotaiStore.get(shouldOpenAiChatAfterOnboardingState.atom)).toBe(
      false,
    );
  });

  it('should do nothing when no onboarding checkout is pending', () => {
    renderAndEnter({
      isOnboardingCheckoutPending: false,
      onboardingStatus: OnboardingStatus.COMPLETED,
    });

    expect(jotaiStore.get(shouldOpenAiChatAfterOnboardingState.atom)).toBe(
      false,
    );
  });

  it('should keep the checkout pending while the onboarding is not completed yet', () => {
    renderAndEnter({
      isOnboardingCheckoutPending: true,
      onboardingStatus: OnboardingStatus.PLAN_REQUIRED,
    });

    expect(jotaiStore.get(isOnboardingCheckoutPendingState.atom)).toBe(true);
    expect(jotaiStore.get(shouldOpenAiChatAfterOnboardingState.atom)).toBe(
      false,
    );
  });

  it('should consume the pending onboarding checkout so it cannot replay', () => {
    renderAndEnter({
      isOnboardingCheckoutPending: true,
      onboardingStatus: OnboardingStatus.COMPLETED,
    });

    expect(jotaiStore.get(isOnboardingCheckoutPendingState.atom)).toBe(false);

    jotaiStore.set(shouldOpenAiChatAfterOnboardingState.atom, false);

    enterWorkspace();

    expect(jotaiStore.get(shouldOpenAiChatAfterOnboardingState.atom)).toBe(
      false,
    );
  });
});
