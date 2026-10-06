import { type OnboardingCreditsStep } from '@/onboarding/types/OnboardingCreditsStep';

export type OnboardingCreditsProgress = {
  rewardCreditsByStep: Record<OnboardingCreditsStep, number>;
  earnedCredits: number;
  earnedCreditsByStep: {
    step: OnboardingCreditsStep;
    credits: number;
    rewardCredits: number;
  }[];
  goalCredits: number;
  currentStep: OnboardingCreditsStep | null;
  currentStepCredits: number;
  seenCredits: number;
  newlyEarnedCredits: number;
  lostCredits: number;
  isFirstCreditsGain: boolean;
  inviteTeamButtonReward: {
    creditsReward: number;
    isRewardPerItem: boolean;
  };
};
