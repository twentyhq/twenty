import { useEffect } from 'react';

import { VerifyLoginTokenEffect } from '@/auth/components/VerifyLoginTokenEffect';
import { onboardingActivationFailedState } from '@/onboarding/states/onboardingActivationFailedState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const Verify = () => {
  const setOnboardingActivationFailed = useSetAtomState(
    onboardingActivationFailedState,
  );

  useEffect(() => {
    setOnboardingActivationFailed(false);
  }, [setOnboardingActivationFailed]);

  return <VerifyLoginTokenEffect />;
};
