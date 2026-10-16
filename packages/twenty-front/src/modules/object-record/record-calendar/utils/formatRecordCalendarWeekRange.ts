import { format, type Locale } from 'date-fns';
import { type Temporal } from 'temporal-polyfill';
import { turnPlainDateToShiftedDateInSystemTimeZone } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

type FormatRecordCalendarWeekRangeArgs = {
  firstDayOfWeek: Temporal.PlainDate;
  lastDayOfWeek: Temporal.PlainDate;
  locale: Locale;
};

export const formatRecordCalendarWeekRange = ({
  firstDayOfWeek,
  lastDayOfWeek,
  locale,
}: FormatRecordCalendarWeekRangeArgs) => {
  const firstDay = turnPlainDateToShiftedDateInSystemTimeZone(firstDayOfWeek);
  const lastDay = turnPlainDateToShiftedDateInSystemTimeZone(lastDayOfWeek);
  const formatOptions = { locale };

  if (firstDayOfWeek.year !== lastDayOfWeek.year) {
    return `${format(firstDay, doNotTranslate('MMM d, yyyy'), formatOptions)} – ${format(
      lastDay,
      doNotTranslate('MMM d, yyyy'),
      formatOptions,
    )}`;
  }

  if (firstDayOfWeek.month !== lastDayOfWeek.month) {
    return `${format(firstDay, 'MMM d', formatOptions)} – ${format(
      lastDay,
      doNotTranslate('MMM d, yyyy'),
      formatOptions,
    )}`;
  }

  return `${format(firstDay, 'MMM d', formatOptions)} – ${format(
    lastDay,
    doNotTranslate('d, yyyy'),
    formatOptions,
  )}`;
};
