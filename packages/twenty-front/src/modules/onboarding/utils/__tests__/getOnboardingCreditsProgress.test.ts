import { type OnboardingConfig } from '@/client-config/types/OnboardingConfig';
import { ONBOARDING_FREE_CREDITS_DEFAULT_VALUE } from '@/onboarding/constants/OnboardingFreeCreditsDefaultValue';
import { type OnboardingFreeCredits } from '@/onboarding/types/OnboardingFreeCredits';
import { getOnboardingCreditsProgress } from '@/onboarding/utils/getOnboardingCreditsProgress';
import { type FullNameMetadata } from 'twenty-shared/types';
import { OnboardingStatus } from '~/generated-metadata/graphql';

const onboardingConfig: OnboardingConfig = {
  importContactsCreditsReward: 2,
  inviteTeamCreditsRewardPerUser: 0.5,
  installAppsCreditsReward: 1,
  createProfileCreditsReward: 0.5,
  upgradeCreditsReward: 0.5,
  inviteTeamMaxInvites: 4,
};

const PROFILE_CREDITS_CASES: {
  title: string;
  onboardingStatus: OnboardingStatus;
  isWorkspaceCreator: boolean;
  profileName: FullNameMetadata | null;
  createProfile: number;
}[] = [
  {
    title: 'count the profile names on the profile step',
    onboardingStatus: OnboardingStatus.PROFILE_CREATION,
    isWorkspaceCreator: true,
    profileName: { firstName: 'Tim', lastName: 'Apple' },
    createProfile: 0.5,
  },
  {
    title: 'not count the profile step while a name is empty',
    onboardingStatus: OnboardingStatus.PROFILE_CREATION,
    isWorkspaceCreator: true,
    profileName: { firstName: 'Tim', lastName: '' },
    createProfile: 0,
  },
  {
    title: 'not count the profile step without a name',
    onboardingStatus: OnboardingStatus.PROFILE_CREATION,
    isWorkspaceCreator: true,
    profileName: null,
    createProfile: 0,
  },
  {
    title: 'not count the profile step for a member who did not create it',
    onboardingStatus: OnboardingStatus.PROFILE_CREATION,
    isWorkspaceCreator: false,
    profileName: { firstName: 'Tim', lastName: 'Apple' },
    createProfile: 0,
  },
  {
    title: 'not count the profile names before the profile step',
    onboardingStatus: OnboardingStatus.APPS_INSTALLATION,
    isWorkspaceCreator: true,
    profileName: { firstName: 'Tim', lastName: 'Apple' },
    createProfile: 0,
  },
];

const buildOnboardingFreeCredits = (
  onboardingFreeCredits: Partial<OnboardingFreeCredits> = {},
): OnboardingFreeCredits => ({
  ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
  ...onboardingFreeCredits,
});

describe('getOnboardingCreditsProgress', () => {
  it('should offer the email reward on the first step', () => {
    expect(
      getOnboardingCreditsProgress({
        onboardingFreeCredits: buildOnboardingFreeCredits(),
        onboardingConfig,
        onboardingStatus: OnboardingStatus.SYNC_EMAIL,
        isWorkspaceCreator: true,
        isPlanRequired: true,
        profileName: null,
        inviteTeamValidEmailsCount: 0,
      }),
    ).toEqual({
      rewardCreditsByStep: {
        importContacts: 2,
        installApps: 1,
        createProfile: 0.5,
        inviteTeam: 2,
        upgradeTrial: 0.5,
      },
      earnedCredits: 0,
      earnedCreditsByStep: [],
      goalCredits: 0,
      currentStep: 'importContacts',
      currentStepCredits: 2,
      seenCredits: 0,
      newlyEarnedCredits: 0,
      lostCredits: 0,
      isFirstCreditsGain: true,
      inviteTeamButtonReward: { creditsReward: 0.5, isRewardPerItem: true },
    });
  });

  it('should sum the counter fields as earned credits', () => {
    const progress = getOnboardingCreditsProgress({
      onboardingFreeCredits: buildOnboardingFreeCredits({
        importContacts: 2,
        installApps: 1,
        createProfile: 0.5,
        inviteTeam: 1,
        upgradeTrial: 0.5,
        seenCredits: 3,
      }),
      onboardingConfig,
      onboardingStatus: OnboardingStatus.COMPLETED,
      isWorkspaceCreator: true,
      isPlanRequired: true,
      profileName: null,
      inviteTeamValidEmailsCount: 0,
    });

    expect(progress.earnedCredits).toBe(5);
  });

  it('should announce the counted credits not seen yet', () => {
    const progress = getOnboardingCreditsProgress({
      onboardingFreeCredits: buildOnboardingFreeCredits({
        importContacts: 2,
        installApps: 1,
        seenCredits: 2,
      }),
      onboardingConfig,
      onboardingStatus: OnboardingStatus.PROFILE_CREATION,
      isWorkspaceCreator: true,
      isPlanRequired: false,
      profileName: null,
      inviteTeamValidEmailsCount: 0,
    });

    expect(progress.earnedCredits).toBe(3);
    expect(progress.newlyEarnedCredits).toBe(1);
    expect(progress.isFirstCreditsGain).toBe(false);
  });

  it('should leave the step at hand out of the goal until it is done', () => {
    const progress = getOnboardingCreditsProgress({
      onboardingFreeCredits: buildOnboardingFreeCredits({ importContacts: 2 }),
      onboardingConfig,
      onboardingStatus: OnboardingStatus.APPS_INSTALLATION,
      isWorkspaceCreator: true,
      isPlanRequired: false,
      profileName: null,
      inviteTeamValidEmailsCount: 0,
    });

    expect(progress.earnedCredits).toBe(2);
    expect(progress.goalCredits).toBe(2);
    expect(progress.currentStep).toBe('installApps');
    expect(progress.currentStepCredits).toBe(1);
  });

  it('should not count the email reward while the mailbox step is at hand', () => {
    expect(
      getOnboardingCreditsProgress({
        onboardingFreeCredits: buildOnboardingFreeCredits({
          importContacts: 2,
        }),
        onboardingConfig,
        onboardingStatus: OnboardingStatus.SYNC_EMAIL,
        isWorkspaceCreator: true,
        isPlanRequired: true,
        profileName: null,
        inviteTeamValidEmailsCount: 0,
      }),
    ).toEqual({
      rewardCreditsByStep: {
        importContacts: 2,
        installApps: 1,
        createProfile: 0.5,
        inviteTeam: 2,
        upgradeTrial: 0.5,
      },
      earnedCredits: 0,
      earnedCreditsByStep: [],
      goalCredits: 0,
      currentStep: 'importContacts',
      currentStepCredits: 2,
      seenCredits: 0,
      newlyEarnedCredits: 0,
      lostCredits: 0,
      isFirstCreditsGain: true,
      inviteTeamButtonReward: { creditsReward: 0.5, isRewardPerItem: true },
    });
  });

  it('should keep skipped steps in the goal on the profile step', () => {
    const progress = getOnboardingCreditsProgress({
      onboardingFreeCredits: buildOnboardingFreeCredits(),
      onboardingConfig,
      onboardingStatus: OnboardingStatus.PROFILE_CREATION,
      isWorkspaceCreator: true,
      isPlanRequired: false,
      profileName: null,
      inviteTeamValidEmailsCount: 0,
    });

    expect(progress.earnedCredits).toBe(0);
    expect(progress.goalCredits).toBe(3);
    expect(progress.currentStep).toBe('createProfile');
  });

  it('should count the profile reward once the profile is created', () => {
    const progress = getOnboardingCreditsProgress({
      onboardingFreeCredits: buildOnboardingFreeCredits({ createProfile: 0.5 }),
      onboardingConfig,
      onboardingStatus: OnboardingStatus.INVITE_TEAM,
      isWorkspaceCreator: true,
      isPlanRequired: false,
      profileName: null,
      inviteTeamValidEmailsCount: 0,
    });

    expect(progress.earnedCredits).toBe(0.5);
    expect(progress.goalCredits).toBe(3.5);
    expect(progress.currentStep).toBe('inviteTeam');
    expect(progress.currentStepCredits).toBe(2);
  });

  it('should only count the sent invites in the goal', () => {
    const progress = getOnboardingCreditsProgress({
      onboardingFreeCredits: buildOnboardingFreeCredits({
        importContacts: 2,
        createProfile: 0.5,
        inviteTeam: 1,
      }),
      onboardingConfig,
      onboardingStatus: OnboardingStatus.BOOK_CALL,
      isWorkspaceCreator: true,
      isPlanRequired: true,
      profileName: null,
      inviteTeamValidEmailsCount: 0,
    });

    expect(progress.earnedCredits).toBe(3.5);
    expect(progress.goalCredits).toBe(4.5);
  });

  it('should point at the upgrade reward on the plan step', () => {
    const progress = getOnboardingCreditsProgress({
      onboardingFreeCredits: buildOnboardingFreeCredits({ importContacts: 2 }),
      onboardingConfig,
      onboardingStatus: OnboardingStatus.PLAN_REQUIRED,
      isWorkspaceCreator: true,
      isPlanRequired: true,
      profileName: null,
      inviteTeamValidEmailsCount: 0,
    });

    expect(progress.goalCredits).toBe(4);
    expect(progress.currentStep).toBe('upgradeTrial');
    expect(progress.currentStepCredits).toBe(0.5);
  });

  it('should stop pointing at the upgrade once the trial is upgraded', () => {
    const progress = getOnboardingCreditsProgress({
      onboardingFreeCredits: buildOnboardingFreeCredits({
        importContacts: 2,
        upgradeTrial: 0.5,
      }),
      onboardingConfig,
      onboardingStatus: OnboardingStatus.PLAN_REQUIRED,
      isWorkspaceCreator: true,
      isPlanRequired: true,
      profileName: null,
      inviteTeamValidEmailsCount: 0,
    });

    expect(progress.earnedCredits).toBe(2.5);
    expect(progress.currentStep).toBeNull();
  });

  it('should announce the lost upgrade credits', () => {
    const progress = getOnboardingCreditsProgress({
      onboardingFreeCredits: buildOnboardingFreeCredits({
        importContacts: 2,
        seenCredits: 2,
      }),
      onboardingConfig,
      onboardingStatus: OnboardingStatus.PLAN_REQUIRED,
      isWorkspaceCreator: true,
      isPlanRequired: true,
      profileName: null,
      inviteTeamValidEmailsCount: 0,
      upgradeTrialLostCredits: 0.5,
    });

    expect(progress.lostCredits).toBe(0.5);
  });

  it('should hold the lost upgrade credits while earned credits are announced', () => {
    const progress = getOnboardingCreditsProgress({
      onboardingFreeCredits: buildOnboardingFreeCredits({ importContacts: 2 }),
      onboardingConfig,
      onboardingStatus: OnboardingStatus.PLAN_REQUIRED,
      isWorkspaceCreator: true,
      isPlanRequired: true,
      profileName: null,
      inviteTeamValidEmailsCount: 0,
      upgradeTrialLostCredits: 0.5,
    });

    expect(progress.newlyEarnedCredits).toBe(2);
    expect(progress.lostCredits).toBe(0);
  });

  it('should leave out the upgrade reward once the workspace has a plan', () => {
    const progress = getOnboardingCreditsProgress({
      onboardingFreeCredits: buildOnboardingFreeCredits(),
      onboardingConfig,
      onboardingStatus: OnboardingStatus.COMPLETED,
      isWorkspaceCreator: true,
      isPlanRequired: false,
      profileName: null,
      inviteTeamValidEmailsCount: 0,
    });

    expect(progress.goalCredits).toBe(3.5);
  });

  it('should keep the earned upgrade reward in the goal once the workspace has a plan', () => {
    const progress = getOnboardingCreditsProgress({
      onboardingFreeCredits: buildOnboardingFreeCredits({
        importContacts: 2,
        installApps: 1,
        createProfile: 0.5,
        upgradeTrial: 0.5,
      }),
      onboardingConfig,
      onboardingStatus: OnboardingStatus.COMPLETED,
      isWorkspaceCreator: true,
      isPlanRequired: false,
      profileName: null,
      inviteTeamValidEmailsCount: 0,
    });

    expect(progress.earnedCredits).toBe(4);
    expect(progress.goalCredits).toBe(4);
  });

  it('should recap what each step done earned out of its reward', () => {
    const progress = getOnboardingCreditsProgress({
      onboardingFreeCredits: buildOnboardingFreeCredits({
        importContacts: 2,
        createProfile: 0.5,
        inviteTeam: 0.5,
      }),
      onboardingConfig,
      onboardingStatus: OnboardingStatus.PLAN_REQUIRED,
      isWorkspaceCreator: true,
      isPlanRequired: true,
      profileName: null,
      inviteTeamValidEmailsCount: 0,
    });

    expect(progress.earnedCreditsByStep).toEqual([
      { step: 'importContacts', credits: 2, rewardCredits: 2 },
      { step: 'installApps', credits: 0, rewardCredits: 1 },
      { step: 'createProfile', credits: 0.5, rewardCredits: 0.5 },
      { step: 'inviteTeam', credits: 0.5, rewardCredits: 2 },
      { step: 'upgradeTrial', credits: 0, rewardCredits: 0.5 },
    ]);
  });

  it('should leave the step at hand out of the recap until it earns credits', () => {
    const progress = getOnboardingCreditsProgress({
      onboardingFreeCredits: buildOnboardingFreeCredits({ importContacts: 2 }),
      onboardingConfig,
      onboardingStatus: OnboardingStatus.APPS_INSTALLATION,
      isWorkspaceCreator: true,
      isPlanRequired: false,
      profileName: null,
      inviteTeamValidEmailsCount: 0,
    });

    expect(progress.earnedCreditsByStep).toEqual([
      { step: 'importContacts', credits: 2, rewardCredits: 2 },
    ]);
  });

  it('should leave out the workspace creator rewards for other members', () => {
    const progress = getOnboardingCreditsProgress({
      onboardingFreeCredits: buildOnboardingFreeCredits(),
      onboardingConfig,
      onboardingStatus: OnboardingStatus.SYNC_EMAIL,
      isWorkspaceCreator: false,
      isPlanRequired: false,
      profileName: null,
      inviteTeamValidEmailsCount: 0,
    });

    expect(progress.goalCredits).toBe(0);
    expect(progress.currentStep).toBeNull();
    expect(progress.currentStepCredits).toBe(0);
  });

  it('should count the apps credits while the install runs on the apps step', () => {
    const progress = getOnboardingCreditsProgress({
      onboardingFreeCredits: buildOnboardingFreeCredits({ installApps: 1 }),
      onboardingConfig,
      onboardingStatus: OnboardingStatus.APPS_INSTALLATION,
      isWorkspaceCreator: true,
      isPlanRequired: false,
      profileName: null,
      inviteTeamValidEmailsCount: 0,
    });

    expect(progress.earnedCredits).toBe(1);
    expect(progress.currentStep).toBeNull();
    expect(progress.currentStepCredits).toBe(0);
  });

  it.each(PROFILE_CREDITS_CASES)(
    'should $title',
    ({ onboardingStatus, isWorkspaceCreator, profileName, createProfile }) => {
      const progress = getOnboardingCreditsProgress({
        onboardingFreeCredits: buildOnboardingFreeCredits(),
        onboardingConfig,
        onboardingStatus,
        isWorkspaceCreator,
        isPlanRequired: false,
        profileName,
        inviteTeamValidEmailsCount: 0,
      });

      expect(progress.earnedCredits).toBe(createProfile);
    },
  );

  it('should count the saved profile credits once the profile step is done', () => {
    const progress = getOnboardingCreditsProgress({
      onboardingFreeCredits: buildOnboardingFreeCredits({ createProfile: 0.5 }),
      onboardingConfig,
      onboardingStatus: OnboardingStatus.INVITE_TEAM,
      isWorkspaceCreator: true,
      isPlanRequired: false,
      profileName: null,
      inviteTeamValidEmailsCount: 0,
    });

    expect(progress.earnedCredits).toBe(0.5);
  });

  it('should reward each teammate on the invite button until an email is typed', () => {
    const buildInviteTeamButtonReward = (inviteTeamValidEmailsCount: number) =>
      getOnboardingCreditsProgress({
        onboardingFreeCredits: buildOnboardingFreeCredits(),
        onboardingConfig,
        onboardingStatus: OnboardingStatus.INVITE_TEAM,
        isWorkspaceCreator: true,
        isPlanRequired: false,
        profileName: null,
        inviteTeamValidEmailsCount,
      }).inviteTeamButtonReward;

    expect(buildInviteTeamButtonReward(0)).toEqual({
      creditsReward: 0.5,
      isRewardPerItem: true,
    });
    expect(buildInviteTeamButtonReward(3)).toEqual({
      creditsReward: 1.5,
      isRewardPerItem: false,
    });
    expect(buildInviteTeamButtonReward(6)).toEqual({
      creditsReward: 2,
      isRewardPerItem: false,
    });
  });
});
