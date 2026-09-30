import { createStore } from 'jotai';
import { type FullNameMetadata } from 'twenty-shared/types';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { ONBOARDING_CREDITS_PROGRESS_EMPTY_VALUE } from '@/onboarding/constants/OnboardingCreditsProgressEmptyValue';
import { onboardingCreateProfileDraftState } from '@/onboarding/states/onboardingCreateProfileDraftState';
import { onboardingInviteTeamEmailsDraftState } from '@/onboarding/states/onboardingInviteTeamEmailsDraftState';
import { onboardingCreditsProgressSelector } from '@/onboarding/states/selectors/onboardingCreditsProgressSelector';
import { OnboardingStatus } from '~/generated-metadata/graphql';
import {
  mockCurrentWorkspace,
  mockedUserData,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';

const PROFILE_NAME_CASES: {
  title: string;
  onboardingCreateProfileDraft: FullNameMetadata | null;
  workspaceMemberName: FullNameMetadata;
  earnedCredits: number;
}[] = [
  {
    title: 'count the typed names',
    onboardingCreateProfileDraft: { firstName: 'Tim', lastName: 'Apple' },
    workspaceMemberName: { firstName: '', lastName: '' },
    earnedCredits: 0.5,
  },
  {
    title: 'count the saved names when nothing is typed',
    onboardingCreateProfileDraft: null,
    workspaceMemberName: { firstName: 'Tim', lastName: 'Apple' },
    earnedCredits: 0.5,
  },
  {
    title: 'prefer a typed empty name over the saved names',
    onboardingCreateProfileDraft: { firstName: 'Tim', lastName: '' },
    workspaceMemberName: { firstName: 'Tim', lastName: 'Apple' },
    earnedCredits: 0,
  },
];

const buildStore = () => {
  const store = createStore();

  store.set(currentWorkspaceState.atom, mockCurrentWorkspace);
  store.set(currentUserState.atom, {
    ...mockedUserData,
    isWorkspaceCreator: true,
    onboardingStatus: OnboardingStatus.PROFILE_CREATION,
  });
  store.set(onboardingConfigState.atom, {
    importContactsCreditsReward: 1,
    inviteTeamCreditsRewardPerUser: 0.5,
    installAppsCreditsReward: 0.5,
    createProfileCreditsReward: 0.5,
    upgradeCreditsReward: 2,
    inviteTeamMaxInvites: 5,
  });

  return store;
};

describe('onboardingCreditsProgressSelector', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('should earn nothing until the onboarding config loads', () => {
    const store = buildStore();

    store.set(onboardingConfigState.atom, null);

    expect(store.get(onboardingCreditsProgressSelector.atom)).toEqual(
      ONBOARDING_CREDITS_PROGRESS_EMPTY_VALUE,
    );
  });

  it.each(PROFILE_NAME_CASES)(
    'should $title on the profile step',
    ({ onboardingCreateProfileDraft, workspaceMemberName, earnedCredits }) => {
      const store = buildStore();

      store.set(currentWorkspaceMemberState.atom, {
        ...mockedWorkspaceMemberData,
        name: workspaceMemberName,
      });
      store.set(
        onboardingCreateProfileDraftState.atom,
        onboardingCreateProfileDraft,
      );

      expect(
        store.get(onboardingCreditsProgressSelector.atom).earnedCredits,
      ).toBe(earnedCredits);
    },
  );

  it('should reward the valid invite emails typed so far', () => {
    const store = buildStore();

    store.set(onboardingInviteTeamEmailsDraftState.atom, [
      'grace@example.com',
      'alan@',
      'Grace@Example.com',
      'ada@example.com',
    ]);

    expect(
      store.get(onboardingCreditsProgressSelector.atom).inviteTeamButtonReward,
    ).toEqual({ creditsReward: 1, isRewardPerItem: false });
  });
});
