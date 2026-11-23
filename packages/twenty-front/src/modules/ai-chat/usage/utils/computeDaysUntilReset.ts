const MILLISECONDS_PER_DAY = 86400000;

export const computeDaysUntilReset = (periodEnd: string) =>
  Math.max(
    0,
    Math.ceil(
      (new Date(periodEnd).getTime() - Date.now()) / MILLISECONDS_PER_DAY,
    ),
  );
