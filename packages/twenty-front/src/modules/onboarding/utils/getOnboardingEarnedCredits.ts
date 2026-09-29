import { ONBOARDING_CREDITS_STEPS } from '@/onboarding/constants/OnboardingCreditsSteps';
import { type OnboardingFreeCredits } from '@/onboarding/types/OnboardingFreeCredits';

export const getOnboardingEarnedCredits = (
  onboardingFreeCredits: OnboardingFreeCredits,
) =>
  ONBOARDING_CREDITS_STEPS.reduce(
    (earnedCredits, step) => earnedCredits + onboardingFreeCredits[step],
    0,
  );
