export const getCurrentMonthPeriodDates = (
  now: Date = new Date(),
): { periodStart: string; periodEnd: string } => ({
  periodStart: new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  ).toISOString(),
  periodEnd: new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  ).toISOString(),
});
