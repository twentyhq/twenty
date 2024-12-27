import { addDays, addMonths, startOfDay, subMonths } from 'date-fns';

export const getHighlightedDates = (highlightedDateRange?: {
  start: Date;
  end: Date;
}): Date[] => {
  if (!highlightedDateRange) return [];
  const { start, end } = highlightedDateRange;

  const highlightedDates: Date[] = [];
  const currentDate = startOfDay(new Date());
  const minDate = subMonths(currentDate, 2);
  const maxDate = addMonths(currentDate, 2);

  const startDate = start < minDate ? minDate : start;
  const lastDate = end > maxDate ? maxDate : end;

  let dateToHighlight = new Date(startDate);

  while (dateToHighlight <= lastDate) {
    highlightedDates.push(dateToHighlight);
    dateToHighlight = addDays(dateToHighlight, 1);
  }

  return highlightedDates;
};
