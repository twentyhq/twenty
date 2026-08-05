const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;

export const formatSlackAssistantDuration = (
  durationMilliseconds: number,
): string => {
  const totalSeconds = Math.max(
    0,
    Math.round(durationMilliseconds / MILLISECONDS_PER_SECOND),
  );

  if (totalSeconds < SECONDS_PER_MINUTE) {
    return `${totalSeconds}s`;
  }

  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;

  if (seconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${seconds}s`;
};
