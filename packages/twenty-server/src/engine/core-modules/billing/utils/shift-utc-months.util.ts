/* @license Enterprise */

// Stripe's period boundaries are UTC instants, and date-fns shifts dates in the
// server's local time: that moves each boundary by the offset and, around a
// daylight-saving change, lands it on the wrong side of the period it defines.
// Every billing period projection goes through here so the arithmetic stays in
// UTC in one place.
export const shiftUtcMonths = ({
  date,
  months,
  dayOfMonth,
}: {
  date: Date;
  months: number;
  // Defaults to the day the date already carries. Passed explicitly to re-apply
  // a billing anchor that the stored boundary had clamped away.
  dayOfMonth?: number;
}): Date => {
  const year = date.getUTCFullYear();
  const targetMonth = date.getUTCMonth() + months;

  // Day 0 of the month after the target is the last day of the target itself,
  // and Date.UTC rolls a month index past either end of the year.
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
