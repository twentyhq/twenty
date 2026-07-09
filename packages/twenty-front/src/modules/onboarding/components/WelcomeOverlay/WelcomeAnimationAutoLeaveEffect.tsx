import { useEffect } from 'react';

const WELCOME_HOLD_DURATION_MS = 2900;

type WelcomeAnimationAutoLeaveEffectProps = {
  onAutoLeave: () => void;
};

export const WelcomeAnimationAutoLeaveEffect = ({
  onAutoLeave,
}: WelcomeAnimationAutoLeaveEffectProps) => {
  useEffect(() => {
    const autoLeaveTimeoutId = setTimeout(
      onAutoLeave,
      WELCOME_HOLD_DURATION_MS,
    );

    return () => {
      clearTimeout(autoLeaveTimeoutId);
    };
  }, [onAutoLeave]);

  return null;
};
