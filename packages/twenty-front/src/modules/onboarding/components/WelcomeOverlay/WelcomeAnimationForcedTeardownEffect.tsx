import { useEffect } from 'react';

const FORCED_TEARDOWN_DELAY_IN_MS = 1200;

type WelcomeAnimationForcedTeardownEffectProps = {
  onForcedTeardown: () => void;
};

export const WelcomeAnimationForcedTeardownEffect = ({
  onForcedTeardown,
}: WelcomeAnimationForcedTeardownEffectProps) => {
  useEffect(() => {
    const forcedTeardownTimeoutId = setTimeout(
      onForcedTeardown,
      FORCED_TEARDOWN_DELAY_IN_MS,
    );

    return () => {
      clearTimeout(forcedTeardownTimeoutId);
    };
  }, [onForcedTeardown]);

  return null;
};
