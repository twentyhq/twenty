import { type Temporal } from 'temporal-polyfill';

export const getPlainDateStartOfWeek = ({
  day,
  weekStartsOnDayIndex,
}: {
  day: Temporal.PlainDate;
  weekStartsOnDayIndex: number;
}): Temporal.PlainDate => {
  const daysSinceStartOfWeek =
    ((day.dayOfWeek % 7) - weekStartsOnDayIndex + 7) % 7;

  return day.subtract({ days: daysSinceStartOfWeek });
};
