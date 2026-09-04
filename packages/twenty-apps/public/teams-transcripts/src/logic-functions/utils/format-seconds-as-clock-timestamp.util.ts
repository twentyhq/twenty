export const formatSecondsAsClockTimestamp = (totalSeconds: number): string => {
  const wholeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(wholeSeconds / 60);
  const seconds = wholeSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};
