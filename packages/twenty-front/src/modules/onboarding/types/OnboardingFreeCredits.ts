import { type OnboardingCreditsStep } from '@/onboarding/types/OnboardingCreditsStep';

export type OnboardingFreeCredits = Record<OnboardingCreditsStep, number> & {
  seenCredits: number;
};
