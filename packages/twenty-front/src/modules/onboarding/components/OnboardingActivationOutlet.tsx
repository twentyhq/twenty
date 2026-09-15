import { Outlet } from 'react-router-dom';

import { OnboardingActivationStepsProgress } from '@/onboarding/components/OnboardingActivationStepsProgress';
import { OnboardingVerifyLayout } from '@/onboarding/components/OnboardingVerifyLayout';
import { onboardingActivationFailedState } from '@/onboarding/states/onboardingActivationFailedState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const OnboardingActivationOutlet = () => {
  const onboardingActivationFailed = useAtomStateValue(
    onboardingActivationFailedState,
  );

  return (
    <>
      {!onboardingActivationFailed && (
        <OnboardingVerifyLayout>
          <OnboardingActivationStepsProgress />
        </OnboardingVerifyLayout>
      )}
      <Outlet />
    </>
  );
};
