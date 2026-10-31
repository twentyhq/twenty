// Sentry crontab schedules have no seconds field; BullMQ patterns may have one.
export const toMinuteLevelCronPattern = (cronPattern: string): string => {
  const fields = cronPattern.split(' ');

  return fields.length === 6 ? fields.slice(1).join(' ') : cronPattern;
};
