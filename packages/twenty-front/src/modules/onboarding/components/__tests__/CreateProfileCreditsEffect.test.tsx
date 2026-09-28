import { act, render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { type OnboardingConfig } from '@/client-config/types/OnboardingConfig';
import { CreateProfileCreditsEffect } from '@/onboarding/components/CreateProfileCreditsEffect';
import { ONBOARDING_FREE_CREDITS_DEFAULT_VALUE } from '@/onboarding/constants/OnboardingFreeCreditsDefaultValue';
import { onboardingFreeCreditsFamilyState } from '@/onboarding/states/onboardingFreeCreditsFamilyState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { OnboardingStatus } from '~/generated-metadata/graphql';
import {
  mockCurrentWorkspace,
  mockedUserData,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';

const onboardingConfig: OnboardingConfig = {
  importContactsCreditsReward: 1,
  inviteTeamCreditsRewardPerUser: 0.5,
  installAppsCreditsReward: 0.5,
  createProfileCreditsReward: 0.5,
  upgradeCreditsReward: 2,
  inviteTeamMaxInvites: 5,
};

const getCreateProfileCredits = () =>
  jotaiStore.get(
    onboardingFreeCreditsFamilyState.atomFamily(mockCurrentWorkspace.id),
  ).createProfile;

const renderCreateProfileCreditsEffect = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <CreateProfileCreditsEffect />
    </JotaiProvider>,
  );

describe('CreateProfileCreditsEffect', () => {
  beforeEach(() => {
    localStorage.clear();
    resetJotaiStore();
    jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
    jotaiStore.set(currentUserState.atom, {
      ...mockedUserData,
      isWorkspaceCreator: true,
      onboardingStatus: OnboardingStatus.PROFILE_CREATION,
    });
    jotaiStore.set(
      onboardingFreeCreditsFamilyState.atomFamily(mockCurrentWorkspace.id),
      {
        ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
        createProfile: 0.5,
        seenCredits: 0.5,
      },
    );
  });

  it('should drop the typed profile credits when the page reloads without saved names', () => {
    jotaiStore.set(onboardingConfigState.atom, onboardingConfig);
    jotaiStore.set(currentWorkspaceMemberState.atom, {
      ...mockedWorkspaceMemberData,
      name: { firstName: '', lastName: '' },
    });

    renderCreateProfileCreditsEffect();

    expect(getCreateProfileCredits()).toBe(0);
  });

  it('should count the saved names when the page reloads', () => {
    jotaiStore.set(onboardingConfigState.atom, onboardingConfig);
    jotaiStore.set(currentWorkspaceMemberState.atom, mockedWorkspaceMemberData);

    renderCreateProfileCreditsEffect();

    expect(getCreateProfileCredits()).toBe(0.5);
  });

  it('should count the saved names once the onboarding config loads', () => {
    jotaiStore.set(onboardingConfigState.atom, null);
    jotaiStore.set(currentWorkspaceMemberState.atom, mockedWorkspaceMemberData);

    renderCreateProfileCreditsEffect();

    expect(getCreateProfileCredits()).toBe(0);

    act(() => {
      jotaiStore.set(onboardingConfigState.atom, onboardingConfig);
    });

    expect(getCreateProfileCredits()).toBe(0.5);
  });
});
