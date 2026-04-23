export const calculateNextExecutionsForMinuteInterval = (
  intervalMinutes: number,
  count = 3,
): Date[] => {
  const now = new Date();

  const currentMinutes = now.getUTCMinutes();
  const currentSeconds = now.getUTCSeconds();
  const minutesSinceHour = currentMinutes + currentSeconds / 60;

  const intervalsPassed = Math.floor(minutesSinceHour / intervalMinutes);
  const nextInterval = intervalsPassed + 1;
  const nextMinute = nextInterval * intervalMinutes;

  let nextExecution = new Date(now);
  nextExecution.setUTCSeconds(0, 0);

  if (nextMinute < 60) {
    nextExecution.setUTCMinutes(nextMinute);
  } else {
    nextExecution.setUTCHours(nextExecution.getUTCHours() + 1);
    nextExecution.setUTCMinutes(nextMinute % 60);
  }

  if (nextExecution.getTime() <= now.getTime()) {
    nextExecution = new Date(
      nextExecution.getTime() + intervalMinutes * 60 * 1000,
    );
  }

  return Array.from({ length: count }, (_, i) => {
    return new Date(nextExecution.getTime() + i * intervalMinutes * 60 * 1000);
  });
};
