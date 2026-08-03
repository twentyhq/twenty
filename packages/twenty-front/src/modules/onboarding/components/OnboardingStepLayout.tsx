import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { OnboardingLayout } from '@/onboarding/components/OnboardingLayout';
import { OnboardingTransitionOutlet } from '@/onboarding/components/OnboardingTransitionOutlet';
import { PrefetchPlanRequiredStepEffect } from '@/onboarding/effect-components/PrefetchPlanRequiredStepEffect';
import { useOnboardingFreeCreditsTotal } from '@/onboarding/hooks/useOnboardingFreeCreditsTotal';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

export const OnboardingStepLayout = () => {
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const freeCreditsTotal = useOnboardingFreeCreditsTotal();

  return (
    <OnboardingLayout
      freeCredits={isDefined(onboardingConfig) ? freeCreditsTotal : undefined}
    >
      <PrefetchPlanRequiredStepEffect />
      <OnboardingTransitionOutlet />
    </OnboardingLayout>
  );
};
