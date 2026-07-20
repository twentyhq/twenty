import { OnboardingLayout } from '@/onboarding/components/OnboardingLayout';
import { OnboardingTransitionOutlet } from '@/onboarding/components/OnboardingTransitionOutlet';
import { PrefetchOnboardingBillingEffect } from '@/onboarding/effect-components/PrefetchOnboardingBillingEffect';
import { PrefetchOnboardingImagesEffect } from '@/onboarding/effect-components/PrefetchOnboardingImagesEffect';
import { PrefetchWelcomeAnimationEffect } from '@/onboarding/effect-components/PrefetchWelcomeAnimationEffect';
import { useOnboardingFreeCreditsTotal } from '@/onboarding/hooks/useOnboardingFreeCreditsTotal';
import { usePreloadStripeForPlanRequiredStep } from '@/onboarding/hooks/usePreloadStripeForPlanRequiredStep';

export const OnboardingStepLayout = () => {
  const freeCredits = useOnboardingFreeCreditsTotal();

  usePreloadStripeForPlanRequiredStep();

  return (
    <OnboardingLayout freeCredits={freeCredits}>
      <PrefetchOnboardingBillingEffect />
      <PrefetchWelcomeAnimationEffect />
      <PrefetchOnboardingImagesEffect />
      <OnboardingTransitionOutlet />
    </OnboardingLayout>
  );
};
