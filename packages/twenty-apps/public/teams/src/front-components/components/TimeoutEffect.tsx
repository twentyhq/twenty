import { useEffect, useState } from 'react';

type TimeoutEffectProps = {
  delayMilliseconds: number;
  onTimeout: () => void;
};

export const TimeoutEffect = ({
  delayMilliseconds,
  onTimeout,
}: TimeoutEffectProps) => {
  const [initialOnTimeout] = useState(() => onTimeout);

  useEffect(() => {
    const timeoutId = setTimeout(initialOnTimeout, delayMilliseconds);

    return () => clearTimeout(timeoutId);
  }, [delayMilliseconds, initialOnTimeout]);

  return null;
};
