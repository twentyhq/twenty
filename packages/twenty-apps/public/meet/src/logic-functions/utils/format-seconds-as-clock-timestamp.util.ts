const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

export const formatSecondsAsClockTimestamp = (totalSeconds: number): string => {
  const wholeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(wholeSeconds / SECONDS_PER_HOUR);
  const minutes = Math.floor(
    (wholeSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE,
  );
  const paddedSeconds = String(wholeSeconds % SECONDS_PER_MINUTE).padStart(
    2,
    '0',
  );

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${paddedSeconds}`;
  }

  return `${minutes}:${paddedSeconds}`;
};
