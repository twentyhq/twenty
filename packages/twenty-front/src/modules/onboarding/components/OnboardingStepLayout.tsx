import { OnboardingLayout } from '@/onboarding/components/OnboardingLayout';
import { OnboardingTransitionOutlet } from '@/onboarding/components/OnboardingTransitionOutlet';
import { useOnboardingFreeCreditsTotal } from '@/onboarding/hooks/useOnboardingFreeCreditsTotal';
import { usePreloadStripeForPlanRequiredStep } from '@/onboarding/hooks/usePreloadStripeForPlanRequiredStep';

export const OnboardingStepLayout = () => {
  const freeCredits = useOnboardingFreeCreditsTotal();

  usePreloadStripeForPlanRequiredStep();

  return (
    <OnboardingLayout freeCredits={freeCredits}>
      <OnboardingTransitionOutlet />
    </OnboardingLayout>
  );
};
