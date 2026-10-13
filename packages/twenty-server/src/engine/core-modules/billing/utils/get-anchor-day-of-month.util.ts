/* @license Enterprise */

// Stripe clamps the anchor day to short months, so the later day of the two boundaries recovers it
// A Feb 29 yearly anchor reads as 28 between leap years; the low reading avoids buying a whole extra period
export const getAnchorDayOfMonth = ({
  periodStart,
  periodEnd,
}: {
  periodStart: Date;
  periodEnd: Date;
}): number => Math.max(periodStart.getUTCDate(), periodEnd.getUTCDate());
