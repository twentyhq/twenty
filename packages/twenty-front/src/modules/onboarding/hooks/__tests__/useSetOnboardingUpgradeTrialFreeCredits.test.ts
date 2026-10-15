import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { createElement } from 'react';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { ONBOARDING_FREE_CREDITS_DEFAULT_VALUE } from '@/onboarding/constants/OnboardingFreeCreditsDefaultValue';
import { useSetOnboardingUpgradeTrialFreeCredits } from '@/onboarding/hooks/useSetOnboardingUpgradeTrialFreeCredits';
import { onboardingFreeCreditsFamilyState } from '@/onboarding/states/onboardingFreeCreditsFamilyState';
import { onboardingUpgradeTrialLostCreditsState } from '@/onboarding/states/onboardingUpgradeTrialLostCreditsState';
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

const setStoredUpgradeTrialCredits = (upgradeTrial: number) =>
  jotaiStore.set(
    onboardingFreeCreditsFamilyState.atomFamily(mockCurrentWorkspace.id),
    { ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE, upgradeTrial },
  );

const setOnboardingUpgradeTrialFreeCredits = (isTrialUpgraded: boolean) => {
  const { result } = renderHook(
    () => useSetOnboardingUpgradeTrialFreeCredits(),
    { wrapper: Wrapper },
  );

  act(() => {
    result.current(isTrialUpgraded);
  });
};

describe('useSetOnboardingUpgradeTrialFreeCredits', () => {
  beforeEach(() => {
    localStorage.clear();
    resetJotaiStore();
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      billingSubscriptions: [],
    });
    jotaiStore.set(billingState.atom, {
      __typename: 'Billing',
      isBillingEnabled: true,
      billingUrl: '',
      trialPeriods: [],
    });
    jotaiStore.set(onboardingConfigState.atom, {
      importContactsCreditsReward: 2,
      inviteTeamCreditsRewardPerUser: 0.5,
      createProfileCreditsReward: 0.5,
      upgradeCreditsReward: 4,
      inviteTeamMaxInvites: 4,
    });
    jotaiStore.set(currentUserState.atom, {
      ...mockedUserData,
      isWorkspaceCreator: true,
      onboardingStatus: OnboardingStatus.PLAN_REQUIRED,
    });
  });

  it('should record the upgrade credits as lost when the trial is downgraded', () => {
    setStoredUpgradeTrialCredits(4);

    setOnboardingUpgradeTrialFreeCredits(false);

    expect(jotaiStore.get(onboardingUpgradeTrialLostCreditsState.atom)).toBe(4);
  });

  it('should drop a pending loss when the trial is upgraded again', () => {
    setStoredUpgradeTrialCredits(0);
    jotaiStore.set(onboardingUpgradeTrialLostCreditsState.atom, 4);

    setOnboardingUpgradeTrialFreeCredits(true);

    expect(jotaiStore.get(onboardingUpgradeTrialLostCreditsState.atom)).toBe(0);
  });

  it('should leave a pending loss untouched when the credits do not change', () => {
    setStoredUpgradeTrialCredits(0);
    jotaiStore.set(onboardingUpgradeTrialLostCreditsState.atom, 4);

    setOnboardingUpgradeTrialFreeCredits(false);

    expect(jotaiStore.get(onboardingUpgradeTrialLostCreditsState.atom)).toBe(4);
  });

  it('should not record a loss when the preselected trial was never counted', () => {
    setStoredUpgradeTrialCredits(0);

    setOnboardingUpgradeTrialFreeCredits(false);

    expect(jotaiStore.get(onboardingUpgradeTrialLostCreditsState.atom)).toBe(0);
  });
});
