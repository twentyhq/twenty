import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { createElement } from 'react';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { ONBOARDING_FREE_CREDITS_DEFAULT_VALUE } from '@/onboarding/constants/OnboardingFreeCreditsDefaultValue';
import { useMarkOnboardingFreeCreditsAsSeen } from '@/onboarding/hooks/useMarkOnboardingFreeCreditsAsSeen';
import { onboardingCreateProfileDraftState } from '@/onboarding/states/onboardingCreateProfileDraftState';
import { onboardingFreeCreditsFamilyState } from '@/onboarding/states/onboardingFreeCreditsFamilyState';
import { onboardingCreditsProgressSelector } from '@/onboarding/states/selectors/onboardingCreditsProgressSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
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

const renderMarkCreditsAsSeenHook = () =>
  renderHook(
    () => ({
      progress: useAtomStateValue(onboardingCreditsProgressSelector),
      markCreditsAsSeen: useMarkOnboardingFreeCreditsAsSeen(),
    }),
    { wrapper: Wrapper },
  ).result;

describe('useMarkOnboardingFreeCreditsAsSeen', () => {
  beforeEach(() => {
    localStorage.clear();
    resetJotaiStore();
    jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
    jotaiStore.set(onboardingConfigState.atom, {
      importContactsCreditsReward: 2,
      inviteTeamCreditsRewardPerUser: 0.5,
      installAppsCreditsReward: 1,
      createProfileCreditsReward: 0.5,
      upgradeCreditsReward: 0.5,
      inviteTeamMaxInvites: 4,
    });
  });

  it('should hold the email reward back until the mailbox step is past', () => {
    setOnboardingStatus(OnboardingStatus.SYNC_EMAIL);
    jotaiStore.set(
      onboardingFreeCreditsFamilyState.atomFamily(mockCurrentWorkspace.id),
      { ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE, importContacts: 2 },
    );

    const result = renderMarkCreditsAsSeenHook();

    expect(result.current.progress?.newlyEarnedCredits).toBe(0);

    act(() => {
      result.current.markCreditsAsSeen();
    });

    expect(result.current.progress?.seenCredits).toBe(0);

    act(() => {
      setOnboardingStatus(OnboardingStatus.APPS_INSTALLATION);
    });

    expect(result.current.progress?.newlyEarnedCredits).toBe(2);
  });

  it('should mark the counted credits as seen', () => {
    setOnboardingStatus(OnboardingStatus.APPS_INSTALLATION);
    jotaiStore.set(
      onboardingFreeCreditsFamilyState.atomFamily(mockCurrentWorkspace.id),
      { ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE, importContacts: 2 },
    );

    const result = renderMarkCreditsAsSeenHook();

    act(() => {
      result.current.markCreditsAsSeen();
    });

    expect(result.current.progress?.seenCredits).toBe(2);
    expect(result.current.progress?.newlyEarnedCredits).toBe(0);
  });

  it('should stop announcing the typed profile credits once they are seen', () => {
    setOnboardingStatus(OnboardingStatus.PROFILE_CREATION);
    jotaiStore.set(onboardingCreateProfileDraftState.atom, {
      firstName: 'Tim',
      lastName: 'Apple',
    });

    const result = renderMarkCreditsAsSeenHook();

    expect(result.current.progress?.newlyEarnedCredits).toBe(0.5);

    act(() => {
      result.current.markCreditsAsSeen();
    });

    expect(result.current.progress?.newlyEarnedCredits).toBe(0);
  });
});
