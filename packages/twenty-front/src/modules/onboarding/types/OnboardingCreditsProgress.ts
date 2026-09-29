import { type OnboardingCreditsStep } from '@/onboarding/types/OnboardingCreditsStep';

export type OnboardingCreditsProgress = {
  earnedCredits: number;
  earnedCreditsByStep: {
    step: OnboardingCreditsStep;
    credits: number;
    rewardCredits: number;
  }[];
  goalCredits: number;
  currentStep: OnboardingCreditsStep | null;
  currentStepCredits: number;
};
