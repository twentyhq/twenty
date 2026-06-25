import { type Temporal } from 'temporal-polyfill';
import { isPlainDateBefore } from 'twenty-shared/utils';

export const getHighlightedDates = (
  start: Temporal.PlainDate,
  end: Temporal.PlainDate,
): Temporal.PlainDate[] => {
  const highlightedDates: Temporal.PlainDate[] = [];

  let dateToHighlight = start;

  while (isPlainDateBefore(dateToHighlight, end.add({ days: 1 }))) {
    highlightedDates.push(dateToHighlight);
    dateToHighlight = dateToHighlight.add({ days: 1 });
  }

  return highlightedDates;
};
