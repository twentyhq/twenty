import { format, type Locale } from 'date-fns';
import { type Temporal } from 'temporal-polyfill';
import { turnPlainDateToShiftedDateInSystemTimeZone } from 'twenty-shared/utils';

type FormatPlainDateRangeArgs = {
  firstDay: Temporal.PlainDate;
  lastDay: Temporal.PlainDate;
  locale: Locale;
};

export const formatPlainDateRange = ({
  firstDay,
  lastDay,
  locale,
}: FormatPlainDateRangeArgs) => {
  const firstDate = turnPlainDateToShiftedDateInSystemTimeZone(firstDay);
  const lastDate = turnPlainDateToShiftedDateInSystemTimeZone(lastDay);
  const formatOptions = { locale };

  if (firstDay.year !== lastDay.year) {
    return `${format(firstDate, 'MMM d, yyyy', formatOptions)} – ${format(
      lastDate,
      'MMM d, yyyy',
      formatOptions,
    )}`;
  }

  if (firstDay.month !== lastDay.month) {
    return `${format(firstDate, 'MMM d', formatOptions)} – ${format(
      lastDate,
      'MMM d, yyyy',
      formatOptions,
    )}`;
  }

  return `${format(firstDate, 'MMM d', formatOptions)} – ${format(
    lastDate,
    'd, yyyy',
    formatOptions,
  )}`;
};
