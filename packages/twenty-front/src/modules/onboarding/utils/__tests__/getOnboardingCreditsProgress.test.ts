import { type OnboardingConfig } from '@/client-config/types/OnboardingConfig';
import { ONBOARDING_FREE_CREDITS_DEFAULT_VALUE } from '@/onboarding/constants/OnboardingFreeCreditsDefaultValue';
import { type OnboardingCreditsStep } from '@/onboarding/types/OnboardingCreditsStep';
import { type OnboardingFreeCredits } from '@/onboarding/types/OnboardingFreeCredits';
import { getOnboardingCreditsProgress } from '@/onboarding/utils/getOnboardingCreditsProgress';
import { OnboardingStatus } from '~/generated-metadata/graphql';

const onboardingConfig: OnboardingConfig = {
  importContactsCreditsReward: 2,
  inviteTeamCreditsRewardPerUser: 0.5,
  installAppsCreditsReward: 1,
  createProfileCreditsReward: 0.5,
  upgradeCreditsReward: 0.5,
  inviteTeamMaxInvites: 4,
};

const buildOnboardingFreeCredits = (
  onboardingFreeCredits: Partial<OnboardingFreeCredits> = {},
): OnboardingFreeCredits => ({
  ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
  ...onboardingFreeCredits,
});

const LIVE_CREDITS_CASES: {
  step: OnboardingCreditsStep;
  onboardingStatus: OnboardingStatus;
  credits: number;
  currentStepCredits: number;
}[] = [
  {
    step: 'installApps',
    onboardingStatus: OnboardingStatus.APPS_INSTALLATION,
    credits: 1,
    currentStepCredits: 0,
  },
  {
    step: 'createProfile',
    onboardingStatus: OnboardingStatus.PROFILE_CREATION,
    credits: 0.5,
    currentStepCredits: 0,
  },
  {
    step: 'inviteTeam',
    onboardingStatus: OnboardingStatus.INVITE_TEAM,
    credits: 1,
    currentStepCredits: 1,
  },
];

describe('getOnboardingCreditsProgress', () => {
  it('should offer the email reward on the first step', () => {
    expect(
      getOnboardingCreditsProgress({
        onboardingFreeCredits: buildOnboardingFreeCredits(),
        onboardingConfig,
        onboardingStatus: OnboardingStatus.SYNC_EMAIL,
        isWorkspaceCreator: true,
        isPlanRequired: true,
      }),
    ).toEqual({
      earnedCredits: 0,
      earnedCreditsByStep: [],
      goalCredits: 0,
      currentStep: 'importContacts',
      currentStepCredits: 2,
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
    });

    expect(progress.earnedCredits).toBe(5);
  });

  it('should leave the step at hand out of the goal until it is done', () => {
    const progress = getOnboardingCreditsProgress({
      onboardingFreeCredits: buildOnboardingFreeCredits({ importContacts: 2 }),
      onboardingConfig,
      onboardingStatus: OnboardingStatus.APPS_INSTALLATION,
      isWorkspaceCreator: true,
      isPlanRequired: false,
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
      }),
    ).toEqual({
      earnedCredits: 0,
      earnedCreditsByStep: [],
      goalCredits: 0,
      currentStep: 'importContacts',
      currentStepCredits: 2,
    });
  });

  it.each(LIVE_CREDITS_CASES)(
    'should count the $step credits live while its step is at hand',
    ({ step, onboardingStatus, credits, currentStepCredits }) => {
      const progress = getOnboardingCreditsProgress({
        onboardingFreeCredits: buildOnboardingFreeCredits({ [step]: credits }),
        onboardingConfig,
        onboardingStatus,
        isWorkspaceCreator: true,
        isPlanRequired: false,
      });

      expect(progress.earnedCredits).toBe(credits);
      expect(progress.currentStepCredits).toBe(currentStepCredits);
    },
  );

  it('should keep skipped steps in the goal on the profile step', () => {
    const progress = getOnboardingCreditsProgress({
      onboardingFreeCredits: buildOnboardingFreeCredits(),
      onboardingConfig,
      onboardingStatus: OnboardingStatus.PROFILE_CREATION,
      isWorkspaceCreator: true,
      isPlanRequired: false,
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
    });

    expect(progress.earnedCredits).toBe(2.5);
    expect(progress.currentStep).toBeNull();
  });

  it('should leave out the upgrade reward once the workspace has a plan', () => {
    const progress = getOnboardingCreditsProgress({
      onboardingFreeCredits: buildOnboardingFreeCredits(),
      onboardingConfig,
      onboardingStatus: OnboardingStatus.COMPLETED,
      isWorkspaceCreator: true,
      isPlanRequired: false,
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
    });

    expect(progress.goalCredits).toBe(0);
    expect(progress.currentStep).toBeNull();
    expect(progress.currentStepCredits).toBe(0);
  });
});
