const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

const startOfUtcDay = (date: Date): Date =>
  new Date(Math.floor(date.getTime() / ONE_DAY_IN_MS) * ONE_DAY_IN_MS);

// Whole UTC days are the only reporting unit: a caller cannot carve a window narrower than the daily cells it is built from
export const snapApplicationRegistrationAnalyticsPeriodToUtcDays = ({
  periodStart,
  periodEnd,
}: {
  periodStart: Date;
  periodEnd: Date;
}): { periodStart: Date; periodEnd: Date } => {
  const snappedPeriodEndStart = startOfUtcDay(periodEnd);
  const snappedPeriodEnd =
    snappedPeriodEndStart.getTime() === periodEnd.getTime()
      ? snappedPeriodEndStart
      : new Date(snappedPeriodEndStart.getTime() + ONE_DAY_IN_MS);

  return {
    periodStart: startOfUtcDay(periodStart),
    periodEnd: snappedPeriodEnd,
  };
};
