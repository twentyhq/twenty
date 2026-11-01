import { t } from '@lingui/core/macro';

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

export const formatRoundedDuration = (durationMs: number): string => {
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));

  if (totalSeconds < SECONDS_PER_MINUTE) {
    return t`${totalSeconds}s`;
  }

  if (totalSeconds < SECONDS_PER_HOUR) {
    const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
    const seconds = totalSeconds % SECONDS_PER_MINUTE;

    return seconds === 0 ? t`${minutes}m` : t`${minutes}m ${seconds}s`;
  }

  const hours = Math.floor(totalSeconds / SECONDS_PER_HOUR);
  const minutes = Math.floor(
    (totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE,
  );

  return minutes === 0 ? t`${hours}h` : t`${hours}h ${minutes}m`;
};
