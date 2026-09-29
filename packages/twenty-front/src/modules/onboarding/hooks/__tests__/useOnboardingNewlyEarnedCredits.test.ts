import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { createElement } from 'react';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { ONBOARDING_FREE_CREDITS_DEFAULT_VALUE } from '@/onboarding/constants/OnboardingFreeCreditsDefaultValue';
import { useOnboardingNewlyEarnedCredits } from '@/onboarding/hooks/useOnboardingNewlyEarnedCredits';
import { onboardingCreateProfileDraftState } from '@/onboarding/states/onboardingCreateProfileDraftState';
import { onboardingFreeCreditsFamilyState } from '@/onboarding/states/onboardingFreeCreditsFamilyState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { OnboardingStatus } from '~/generated-metadata/graphql';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';

const Wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(JotaiProvider, { store: jotaiStore }, children);

const setOnboardingStatus = (onboardingStatus: OnboardingStatus) =>
  jotaiStore.set(currentUserState.atom, {
    ...mockedUserData,
    isWorkspaceCreator: true,
    onboardingStatus,
  });

describe('useOnboardingNewlyEarnedCredits', () => {
  beforeEach(() => {
    localStorage.clear();
    resetJotaiStore();
    jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
  });

  it('should hold the email reward back until the mailbox step is past', () => {
    setOnboardingStatus(OnboardingStatus.SYNC_EMAIL);
    jotaiStore.set(
      onboardingFreeCreditsFamilyState.atomFamily(mockCurrentWorkspace.id),
      { ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE, importContacts: 2 },
    );

    const { result } = renderHook(() => useOnboardingNewlyEarnedCredits(), {
      wrapper: Wrapper,
    });

    expect(result.current.newlyEarnedCredits).toBe(0);

    act(() => {
      result.current.markCreditsAsSeen();
    });

    expect(result.current.seenCredits).toBe(0);

    act(() => {
      setOnboardingStatus(OnboardingStatus.APPS_INSTALLATION);
    });

    expect(result.current.newlyEarnedCredits).toBe(2);
  });

  it('should stop announcing the typed profile credits once they are seen', () => {
    setOnboardingStatus(OnboardingStatus.PROFILE_CREATION);
    jotaiStore.set(onboardingConfigState.atom, {
      importContactsCreditsReward: 1,
      inviteTeamCreditsRewardPerUser: 0.5,
      installAppsCreditsReward: 0.5,
      createProfileCreditsReward: 0.5,
      upgradeCreditsReward: 2,
      inviteTeamMaxInvites: 5,
    });
    jotaiStore.set(onboardingCreateProfileDraftState.atom, {
      firstName: 'Tim',
      lastName: 'Apple',
    });

    const { result } = renderHook(() => useOnboardingNewlyEarnedCredits(), {
      wrapper: Wrapper,
    });

    expect(result.current.newlyEarnedCredits).toBe(0.5);

    act(() => {
      result.current.markCreditsAsSeen();
    });

    expect(result.current.newlyEarnedCredits).toBe(0);
  });
});
