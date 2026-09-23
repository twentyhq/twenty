import { type OnboardingConfig } from '@/client-config/types/OnboardingConfig';
import { getOnboardingCreditsProgress } from '@/onboarding/utils/getOnboardingCreditsProgress';
import {
  type OnboardingCreditRewards,
  OnboardingStatus,
} from '~/generated-metadata/graphql';

const onboardingConfig: OnboardingConfig = {
  importContactsCreditsReward: 2,
  inviteTeamCreditsRewardPerUser: 0.5,
  installAppsCreditsRewardPerApp: 1,
  inviteTeamMaxInvites: 4,
};

const buildCreditRewards = (
  creditRewards: Partial<Omit<OnboardingCreditRewards, '__typename'>> = {},
): Omit<OnboardingCreditRewards, '__typename'> => ({
  importContactsCredits: 0,
  installAppsCredits: 0,
  inviteTeamCredits: 0,
  enrichmentQualificationCredits: 0,
  totalCredits: 0,
  joinedTeammatesCount: 0,
  pendingInvitationsCount: 0,
  ...creditRewards,
});

describe('getOnboardingCreditsProgress', () => {
  it('should aim at every reward of the setup and point at the email reward on the first step', () => {
    expect(
      getOnboardingCreditsProgress({
        creditRewards: buildCreditRewards(),
        onboardingConfig,
        onboardingStatus: OnboardingStatus.SYNC_EMAIL,
        isFirstWorkspaceMember: true,
      }),
    ).toEqual({
      earnedCredits: 0,
      pendingCredits: 0,
      goalCredits: 7,
      currentStep: 'importContacts',
      currentStepCredits: 2,
      visibleSteps: ['importContacts'],
    });
  });

  it('should reveal the apps reward only once the user reaches that step', () => {
    const progress = getOnboardingCreditsProgress({
      creditRewards: buildCreditRewards({
        importContactsCredits: 2,
        totalCredits: 2,
      }),
      onboardingConfig,
      onboardingStatus: OnboardingStatus.APPS_INSTALLATION,
      isFirstWorkspaceMember: true,
    });

    expect(progress.earnedCredits).toBe(2);
    expect(progress.currentStep).toBe('installApps');
    expect(progress.currentStepCredits).toBe(3);
    expect(progress.visibleSteps).toEqual(['importContacts', 'installApps']);
  });

  it('should not point at a step once its reward is earned', () => {
    const progress = getOnboardingCreditsProgress({
      creditRewards: buildCreditRewards({
        importContactsCredits: 2,
        installAppsCredits: 2,
        totalCredits: 4,
      }),
      onboardingConfig,
      onboardingStatus: OnboardingStatus.APPS_INSTALLATION,
      isFirstWorkspaceMember: true,
    });

    expect(progress.currentStep).toBeNull();
    expect(progress.currentStepCredits).toBe(0);
  });

  it('should count pending invites apart from the credits still to earn', () => {
    const progress = getOnboardingCreditsProgress({
      creditRewards: buildCreditRewards({
        importContactsCredits: 2,
        totalCredits: 2,
        pendingInvitationsCount: 1,
      }),
      onboardingConfig,
      onboardingStatus: OnboardingStatus.INVITE_TEAM,
      isFirstWorkspaceMember: true,
    });

    expect(progress.pendingCredits).toBe(0.5);
    expect(progress.currentStep).toBe('inviteTeam');
    expect(progress.currentStepCredits).toBe(1.5);
    expect(progress.visibleSteps).toEqual([
      'importContacts',
      'installApps',
      'inviteTeam',
    ]);
  });

  it('should leave out first-member rewards for other members', () => {
    const progress = getOnboardingCreditsProgress({
      creditRewards: buildCreditRewards(),
      onboardingConfig,
      onboardingStatus: OnboardingStatus.SYNC_EMAIL,
      isFirstWorkspaceMember: false,
    });

    expect(progress.goalCredits).toBe(2);
    expect(progress.currentStep).toBeNull();
    expect(progress.visibleSteps).toEqual(['inviteTeam']);
  });

  it('should grow the goal to fit a company bonus', () => {
    const progress = getOnboardingCreditsProgress({
      creditRewards: buildCreditRewards({
        enrichmentQualificationCredits: 5,
        totalCredits: 5,
      }),
      onboardingConfig,
      onboardingStatus: OnboardingStatus.SYNC_EMAIL,
      isFirstWorkspaceMember: true,
    });

    expect(progress.earnedCredits).toBe(5);
    expect(progress.goalCredits).toBe(12);
  });
});
