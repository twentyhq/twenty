import { useEffect } from 'react';

import { isWelcomeTitleHandoffTargetReadyState } from '@/onboarding/states/isWelcomeTitleHandoffTargetReadyState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const WELCOME_HOLD_MIN_DURATION_MS = 2900;
const WELCOME_HOLD_MAX_DURATION_MS = 5000;

type WelcomeAnimationAutoLeaveEffectProps = {
  onAutoLeave: () => void;
};

export const WelcomeAnimationAutoLeaveEffect = ({
  onAutoLeave,
}: WelcomeAnimationAutoLeaveEffectProps) => {
  const isWelcomeTitleHandoffTargetReady = useAtomStateValue(
    isWelcomeTitleHandoffTargetReadyState,
  );

  useEffect(() => {
    let hasFired = false;

    const fire = () => {
      if (hasFired) {
        return;
      }
      hasFired = true;
      onAutoLeave();
    };

    const capTimeoutId = setTimeout(fire, WELCOME_HOLD_MAX_DURATION_MS);
    const minHoldTimeoutId = setTimeout(() => {
      if (!isWelcomeTitleHandoffTargetReady) {
        return;
      }
      void document.fonts.ready.then(fire);
    }, WELCOME_HOLD_MIN_DURATION_MS);

    return () => {
      clearTimeout(capTimeoutId);
      clearTimeout(minHoldTimeoutId);
      hasFired = true;
    };
  }, [onAutoLeave, isWelcomeTitleHandoffTargetReady]);

  return null;
};
