import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useRecomputeCreateProfileFreeCredits } from '@/onboarding/hooks/useRecomputeCreateProfileFreeCredits';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const CreateProfileCreditsEffect = () => {
  const isOnboardingConfigLoaded = isDefined(
    useAtomStateValue(onboardingConfigState),
  );
  const recomputeCreateProfileFreeCredits =
    useRecomputeCreateProfileFreeCredits();

  useEffect(() => {
    recomputeCreateProfileFreeCredits();
  }, [isOnboardingConfigLoaded, recomputeCreateProfileFreeCredits]);

  return null;
};
