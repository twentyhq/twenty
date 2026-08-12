export const formatSecondsAsTimer = (totalSeconds: number): string => {
  const clampedTotalSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(clampedTotalSeconds / 60);
  const seconds = clampedTotalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};
