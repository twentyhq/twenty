import { type OnboardingCreditsStep } from '@/onboarding/types/OnboardingCreditsStep';

export type OnboardingCreditsProgress = {
  earnedCredits: number;
  goalCredits: number;
  currentStep: OnboardingCreditsStep | null;
  currentStepCredits: number;
};
