import { Temporal } from 'temporal-polyfill';
import { isPlainDateAfter, isPlainDateBefore } from 'twenty-shared/utils';

export const getHighlightedDates = (
  start: Temporal.PlainDate,
  end: Temporal.PlainDate,
  timeZone: string,
): Temporal.PlainDate[] => {
  const highlightedDates: Temporal.PlainDate[] = [];

  const currentDate = Temporal.Now.zonedDateTimeISO(timeZone)
    .startOfDay()
    .toPlainDate();

  const minDate = currentDate.subtract({ months: 2 });
  const maxDate = currentDate.add({ months: 2 });

  const startDate = isPlainDateBefore(start, minDate) ? minDate : start;
  const lastDate = isPlainDateAfter(end, maxDate) ? maxDate : end;

  let dateToHighlight = startDate;

  while (isPlainDateBefore(dateToHighlight, lastDate.add({ days: 1 }))) {
    highlightedDates.push(dateToHighlight);
    dateToHighlight = dateToHighlight.add({ days: 1 });
  }

  return highlightedDates;
};
