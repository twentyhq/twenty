import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { isOnboardingCheckoutPendingState } from '@/onboarding/states/isOnboardingCheckoutPendingState';
import { isWelcomeAnimationVisibleState } from '@/onboarding/states/isWelcomeAnimationVisibleState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';
import { OnboardingStatus } from '~/generated-metadata/graphql';

export const WelcomeAnimationOnCheckoutReturnEffect = () => {
  const [isOnboardingCheckoutPending, setIsOnboardingCheckoutPending] =
    useAtomState(isOnboardingCheckoutPendingState);
  const setIsWelcomeAnimationVisible = useSetAtomState(
    isWelcomeAnimationVisibleState,
  );
  const onboardingStatus = useOnboardingStatus();

  useEffect(() => {
    if (
      !isOnboardingCheckoutPending ||
      onboardingStatus !== OnboardingStatus.COMPLETED
    ) {
      return;
    }

    setIsOnboardingCheckoutPending(false);
    setIsWelcomeAnimationVisible(true);
  }, [
    isOnboardingCheckoutPending,
    onboardingStatus,
    setIsOnboardingCheckoutPending,
    setIsWelcomeAnimationVisible,
  ]);

  return null;
};
