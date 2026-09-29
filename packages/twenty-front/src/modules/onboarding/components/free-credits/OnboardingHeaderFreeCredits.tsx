import { OnboardingFreeCreditsPill } from '@/onboarding/components/free-credits/OnboardingFreeCreditsPill';
import { useOnboardingCreditsProgress } from '@/onboarding/hooks/useOnboardingCreditsProgress';
import { isDefined } from 'twenty-shared/utils';

export const OnboardingHeaderFreeCredits = () => {
  const progress = useOnboardingCreditsProgress();

  if (
    !isDefined(progress) ||
    (progress.goalCredits <= 0 && progress.currentStepCredits <= 0)
  ) {
    return null;
  }

  return <OnboardingFreeCreditsPill progress={progress} />;
};
