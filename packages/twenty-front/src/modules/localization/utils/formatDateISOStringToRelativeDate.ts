export const formatDateISOStringToRelativeDate = (isoDate: string) => {
  const date = new Date(Date.parse(isoDate));

  const timeElapsed = Date.now() - date.getTime();
  const minutesElapsed = Math.round(timeElapsed / (1000 * 60));
  const hoursElapsed = Math.round(timeElapsed / (1000 * 60 * 60));
  const daysElapsed = Math.round(timeElapsed / (1000 * 60 * 60 * 24));
  const monthsElapsed = Math.round(timeElapsed / (1000 * 60 * 60 * 24 * 30.44));
  const yearsElapsed = Math.round(timeElapsed / (1000 * 60 * 60 * 24 * 365.25));

  const timeIntervals = [
    { value: yearsElapsed, unit: 'year' },
    { value: monthsElapsed, unit: 'month' },
    { value: daysElapsed, unit: 'day' },
    { value: hoursElapsed, unit: 'hour' },
    { value: minutesElapsed, unit: 'minute' },
  ];

  const firstNonZeroInterval = timeIntervals.find((i) => i.value > 0);

  if (firstNonZeroInterval !== undefined) {
    return `${firstNonZeroInterval.value} ${firstNonZeroInterval.unit}${
      firstNonZeroInterval.value > 1 ? 's' : ''
    } ago`;
  }

  return 'Just now';
};
