type TimeUnit = 'year' | 'month' | 'day' | 'hour' | 'minute';

export const formatDateISOStringToRelativeDate = (
  isoDate: string,
  maximumPrecision: TimeUnit = 'minute',
) => {
  const date = new Date(Date.parse(isoDate));

  const now = Date.now();
  const timeElapsed = Math.abs(now - date.getTime());
  const isPast = date.getTime() < now;

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
    const dateAndUnitText = `${firstNonZeroInterval.value} ${firstNonZeroInterval.unit}${
      firstNonZeroInterval.value > 1 ? 's' : ''
    }`;

    if (isPast) {
      return `${dateAndUnitText} ago`;
    }

    return `In ${dateAndUnitText}`;
  }

  if (maximumPrecision === 'minute') {
    return 'Just now';
  }

  if (isPast) {
    return `Less than 1 ${maximumPrecision} ago`; // TODO: 'Today' or Yesterday
  }

  return `In less than 1 ${maximumPrecision}`; // TODO: 'Today' or 'Tomorrow'
};
