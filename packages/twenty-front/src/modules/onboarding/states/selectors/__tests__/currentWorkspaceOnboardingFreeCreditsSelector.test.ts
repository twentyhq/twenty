import { createStore } from 'jotai';
import { type FullNameMetadata } from 'twenty-shared/types';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { ONBOARDING_FREE_CREDITS_DEFAULT_VALUE } from '@/onboarding/constants/OnboardingFreeCreditsDefaultValue';
import { onboardingCreateProfileDraftState } from '@/onboarding/states/onboardingCreateProfileDraftState';
import { onboardingFreeCreditsFamilyState } from '@/onboarding/states/onboardingFreeCreditsFamilyState';
import { currentWorkspaceOnboardingFreeCreditsSelector } from '@/onboarding/states/selectors/currentWorkspaceOnboardingFreeCreditsSelector';
import { OnboardingStatus } from '~/generated-metadata/graphql';
import {
  mockCurrentWorkspace,
  mockedUserData,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';

const EARNED_ONBOARDING_FREE_CREDITS = {
  ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
  importContacts: 2,
  seenCredits: 2,
};

const PROFILE_CREDITS_CASES: {
  title: string;
  onboardingStatus: OnboardingStatus;
  isWorkspaceCreator: boolean;
  onboardingCreateProfileDraft: FullNameMetadata | null;
  createProfile: number;
}[] = [
  {
    title: 'count the typed names on the profile step',
    onboardingStatus: OnboardingStatus.PROFILE_CREATION,
    isWorkspaceCreator: true,
    onboardingCreateProfileDraft: { firstName: 'Tim', lastName: 'Apple' },
    createProfile: 0.5,
  },
  {
    title: 'count the saved names on the profile step when nothing is typed',
    onboardingStatus: OnboardingStatus.PROFILE_CREATION,
    isWorkspaceCreator: true,
    onboardingCreateProfileDraft: null,
    createProfile: 0.5,
  },
  {
    title: 'not count the profile step while a typed name is empty',
    onboardingStatus: OnboardingStatus.PROFILE_CREATION,
    isWorkspaceCreator: true,
    onboardingCreateProfileDraft: { firstName: 'Tim', lastName: '' },
    createProfile: 0,
  },
  {
    title: 'not count the profile step for a member who did not create it',
    onboardingStatus: OnboardingStatus.PROFILE_CREATION,
    isWorkspaceCreator: false,
    onboardingCreateProfileDraft: { firstName: 'Tim', lastName: 'Apple' },
    createProfile: 0,
  },
  {
    title: 'keep the stored profile credits off the profile step',
    onboardingStatus: OnboardingStatus.APPS_INSTALLATION,
    isWorkspaceCreator: true,
    onboardingCreateProfileDraft: { firstName: 'Tim', lastName: 'Apple' },
    createProfile: 0,
  },
];

describe('currentWorkspaceOnboardingFreeCreditsSelector', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('should read the credits of the current workspace', () => {
    const store = createStore();

    store.set(currentWorkspaceState.atom, mockCurrentWorkspace);
    store.set(
      onboardingFreeCreditsFamilyState.atomFamily(mockCurrentWorkspace.id),
      EARNED_ONBOARDING_FREE_CREDITS,
    );

    expect(
      store.get(currentWorkspaceOnboardingFreeCreditsSelector.atom),
    ).toEqual(EARNED_ONBOARDING_FREE_CREDITS);
  });

  it('should fill fields missing from a stored counter with their defaults', () => {
    const workspace = {
      ...mockCurrentWorkspace,
      id: 'workspace-with-partial-credits',
    };

    localStorage.setItem(
      `onboardingFreeCreditsFamilyState__${workspace.id}`,
      JSON.stringify({ importContacts: 2 }),
    );

    const store = createStore();

    store.set(currentWorkspaceState.atom, workspace);

    expect(
      store.get(currentWorkspaceOnboardingFreeCreditsSelector.atom),
    ).toEqual({ ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE, importContacts: 2 });
  });

  it('should read the default credits while the current workspace is not loaded', () => {
    const store = createStore();

    store.set(currentWorkspaceState.atom, null);
    store.set(
      onboardingFreeCreditsFamilyState.atomFamily(''),
      EARNED_ONBOARDING_FREE_CREDITS,
    );

    expect(
      store.get(currentWorkspaceOnboardingFreeCreditsSelector.atom),
    ).toEqual(ONBOARDING_FREE_CREDITS_DEFAULT_VALUE);
  });

  it.each(PROFILE_CREDITS_CASES)(
    'should $title',
    ({
      onboardingStatus,
      isWorkspaceCreator,
      onboardingCreateProfileDraft,
      createProfile,
    }) => {
      const store = createStore();

      store.set(currentWorkspaceState.atom, mockCurrentWorkspace);
      store.set(currentUserState.atom, {
        ...mockedUserData,
        isWorkspaceCreator,
        onboardingStatus,
      });
      store.set(currentWorkspaceMemberState.atom, mockedWorkspaceMemberData);
      store.set(onboardingConfigState.atom, {
        importContactsCreditsReward: 1,
        inviteTeamCreditsRewardPerUser: 0.5,
        installAppsCreditsReward: 0.5,
        createProfileCreditsReward: 0.5,
        upgradeCreditsReward: 2,
        inviteTeamMaxInvites: 5,
      });
      store.set(
        onboardingCreateProfileDraftState.atom,
        onboardingCreateProfileDraft,
      );

      expect(
        store.get(currentWorkspaceOnboardingFreeCreditsSelector.atom)
          .createProfile,
      ).toBe(createProfile);
    },
  );
});
