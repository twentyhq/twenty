/* @license Enterprise */

// date-fns shifts in server local time, which moves Stripe's UTC boundaries around daylight-saving changes.
export const shiftUtcMonths = ({
  date,
  months,
  dayOfMonth,
}: {
  date: Date;
  months: number;
  // Re-applies a billing anchor that the stored boundary had clamped away.
  dayOfMonth?: number;
}): Date => {
  const year = date.getUTCFullYear();
  const targetMonth = date.getUTCMonth() + months;

  const daysInTargetMonth = new Date(
    Date.UTC(year, targetMonth + 1, 0),
  ).getUTCDate();

  return new Date(
    Date.UTC(
      year,
      targetMonth,
      Math.min(dayOfMonth ?? date.getUTCDate(), daysInTargetMonth),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds(),
    ),
  );
};
