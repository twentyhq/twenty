type TimeUnit = 'year' | 'month' | 'day' | 'hour' | 'minute';

export const formatDateISOStringToRelativeDate = (
  isoDate: string,
  maximumPrecision: TimeUnit = 'minute',
) => {
  const date = new Date(Date.parse(isoDate));

  const timeElapsed = Date.now() - date.getTime();
  const minutesElapsed = Math.floor(timeElapsed / (1000 * 60));
  const hoursElapsed = Math.floor(timeElapsed / (1000 * 60 * 60));
  const daysElapsed = Math.floor(timeElapsed / (1000 * 60 * 60 * 24));
  const monthsElapsed = Math.floor(timeElapsed / (1000 * 60 * 60 * 24 * 30.44));
  const yearsElapsed = Math.floor(timeElapsed / (1000 * 60 * 60 * 24 * 365.25));

  const timeIntervals: { unit: TimeUnit; value: number }[] = [
    { unit: 'year', value: yearsElapsed },
    { unit: 'month', value: monthsElapsed },
    { unit: 'day', value: daysElapsed },
    { unit: 'hour', value: hoursElapsed },
    { unit: 'minute', value: minutesElapsed },
  ];

  const maxPrecisionIndex = timeIntervals.findIndex(
    (i) => i.unit === maximumPrecision,
  );

  const timeIntervalsUpToMaximumPrecision = timeIntervals.slice(
    0,
    maxPrecisionIndex + 1,
  );

  const firstNonZeroInterval = timeIntervalsUpToMaximumPrecision.find(
    (i) => i.value > 0,
  );

  if (firstNonZeroInterval !== undefined) {
    return `${firstNonZeroInterval.value} ${firstNonZeroInterval.unit}${
      firstNonZeroInterval.value > 1 ? 's' : ''
    } ago`;
  }

  if (maximumPrecision === 'minute') {
    return 'Just now';
  }

  return `Less than 1 ${maximumPrecision} ago`;
};
