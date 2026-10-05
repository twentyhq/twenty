import { type OnboardingCreditsProgress } from '@/onboarding/types/OnboardingCreditsProgress';

export const ONBOARDING_CREDITS_PROGRESS_EMPTY_VALUE: OnboardingCreditsProgress =
  {
    rewardCreditsByStep: {
      importContacts: 0,
      installApps: 0,
      createProfile: 0,
      inviteTeam: 0,
      upgradeTrial: 0,
    },
    earnedCredits: 0,
    earnedCreditsByStep: [],
    goalCredits: 0,
    currentStep: null,
    currentStepCredits: 0,
    seenCredits: 0,
    newlyEarnedCredits: 0,
    lostCredits: 0,
    isFirstCreditsGain: true,
    inviteTeamButtonReward: { creditsReward: 0, isRewardPerItem: false },
  };
