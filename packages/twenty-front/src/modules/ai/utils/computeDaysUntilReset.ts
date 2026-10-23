const MILLISECONDS_PER_DAY = 86400000;

export const computeDaysUntilReset = (periodEnd: string, nowMs = Date.now()) =>
  Math.max(
    0,
    Math.ceil((new Date(periodEnd).getTime() - nowMs) / MILLISECONDS_PER_DAY),
  );
