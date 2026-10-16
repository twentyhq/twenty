import { useEffect } from 'react';

type LogConsoleAppAnalyticsMidnightEffectProps = {
  now: string;
  onNowChange: (now: string) => void;
};

export const LogConsoleAppAnalyticsMidnightEffect = ({
  now,
  onNowChange,
}: LogConsoleAppAnalyticsMidnightEffectProps) => {
  useEffect(() => {
    const nextUtcMidnight = new Date(now);

    nextUtcMidnight.setUTCHours(24, 0, 0, 0);

    const timeoutId = setTimeout(
      () => onNowChange(new Date().toISOString()),
      Math.max(0, nextUtcMidnight.getTime() - Date.now()),
    );

    return () => clearTimeout(timeoutId);
  }, [now, onNowChange]);

  return null;
};
