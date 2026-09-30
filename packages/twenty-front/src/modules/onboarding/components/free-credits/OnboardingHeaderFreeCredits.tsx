import { OnboardingFreeCreditsPill } from '@/onboarding/components/free-credits/OnboardingFreeCreditsPill';
import { onboardingCreditsProgressSelector } from '@/onboarding/states/selectors/onboardingCreditsProgressSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

export const OnboardingHeaderFreeCredits = () => {
  const onboardingCreditsProgress = useAtomStateValue(
    onboardingCreditsProgressSelector,
  );

  if (
    !isDefined(onboardingCreditsProgress) ||
    (onboardingCreditsProgress.goalCredits <= 0 &&
      onboardingCreditsProgress.currentStepCredits <= 0)
  ) {
    return null;
  }

  return <OnboardingFreeCreditsPill progress={onboardingCreditsProgress} />;
};
