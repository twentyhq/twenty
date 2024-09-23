import { addDays, addMonths, startOfDay, subMonths } from 'date-fns';

export const getHighlightedDates = (highlightedDateRange?: {
  start: Date;
  end: Date;
}): Date[] => {
  if (!highlightedDateRange) return [];
  const { start, end } = highlightedDateRange;

  const highlightedDates: Date[] = [];
  const currentDate = startOfDay(new Date());
  const twoMonthsAgo = subMonths(currentDate, 2);
  const twoMonthsFromNow = addMonths(currentDate, 2);

  let dateToHighlight = start < twoMonthsAgo ? twoMonthsAgo : start;
  const lastDate = end > twoMonthsFromNow ? twoMonthsFromNow : end;

  while (dateToHighlight <= lastDate) {
    highlightedDates.push(dateToHighlight);
    dateToHighlight = addDays(dateToHighlight, 1);
  }

  return highlightedDates;
};
