import { useEffect } from 'react';

import { isWelcomeAnimationLeavingState } from '@/onboarding/states/isWelcomeAnimationLeavingState';
import { isWelcomeAnimationVisibleState } from '@/onboarding/states/isWelcomeAnimationVisibleState';
import { welcomeTitleFlightState } from '@/onboarding/states/welcomeTitleFlightState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const FORCED_TEARDOWN_DELAY_IN_MS = 1100;

export const WelcomeAnimationForcedTeardownEffect = () => {
  const setIsWelcomeAnimationVisible = useSetAtomState(
    isWelcomeAnimationVisibleState,
  );
  const setIsWelcomeAnimationLeaving = useSetAtomState(
    isWelcomeAnimationLeavingState,
  );
  const setWelcomeTitleFlight = useSetAtomState(welcomeTitleFlightState);

  useEffect(() => {
    const forcedTeardownTimeoutId = setTimeout(() => {
      setIsWelcomeAnimationVisible(false);
      setIsWelcomeAnimationLeaving(false);
      setWelcomeTitleFlight(null);
    }, FORCED_TEARDOWN_DELAY_IN_MS);

    return () => {
      clearTimeout(forcedTeardownTimeoutId);
    };
  }, [
    setIsWelcomeAnimationVisible,
    setIsWelcomeAnimationLeaving,
    setWelcomeTitleFlight,
  ]);

  return null;
};
