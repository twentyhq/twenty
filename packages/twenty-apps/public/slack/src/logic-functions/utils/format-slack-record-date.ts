export const formatSlackRecordDate = (
  isoDate: string,
  now: Date = new Date(),
): string | undefined => {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  const showYear = date.getUTCFullYear() !== now.getUTCFullYear();

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(showYear ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  });
};
