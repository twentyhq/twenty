import { useEffect } from 'react';

type FrontComponentMediaRecordingTimerEffectProps = {
  startedAt: number;
  onElapsedSecondsChange: (elapsedSeconds: number) => void;
};

export const FrontComponentMediaRecordingTimerEffect = ({
  startedAt,
  onElapsedSecondsChange,
}: FrontComponentMediaRecordingTimerEffectProps) => {
  useEffect(() => {
    onElapsedSecondsChange(0);

    const elapsedInterval = setInterval(() => {
      onElapsedSecondsChange(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => clearInterval(elapsedInterval);
    // The callback is a state setter; re-registering on its identity would
    // reset the tick on every indicator render.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt]);

  return null;
};
