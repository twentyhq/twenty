import { CalendarSystem } from '@/localization/constants/CalendarSystem';
import { Temporal } from 'temporal-polyfill';

const DATE_INPUT_FIELD_TOKENS = {
  year: 'yyyy',
  month: 'MM',
  day: 'dd',
} as const;

// Input masks use fixed-width numeric tokens, so a date typed in another
// calendar can be rewritten in place to its Gregorian equivalent for date-fns.
export const convertCalendarDateInputToGregorian = ({
  dateInput,
  dateInputFormat,
  calendarSystem,
}: {
  dateInput: string;
  dateInputFormat: string;
  calendarSystem: CalendarSystem;
}): string | null => {
  if (calendarSystem === CalendarSystem.GREGORIAN) {
    return dateInput;
  }

  const fieldIndexes = {
    year: dateInputFormat.indexOf(DATE_INPUT_FIELD_TOKENS.year),
    month: dateInputFormat.indexOf(DATE_INPUT_FIELD_TOKENS.month),
    day: dateInputFormat.indexOf(DATE_INPUT_FIELD_TOKENS.day),
  };

  const readField = (field: keyof typeof DATE_INPUT_FIELD_TOKENS) =>
    Number(
      dateInput.slice(
        fieldIndexes[field],
        fieldIndexes[field] + DATE_INPUT_FIELD_TOKENS[field].length,
      ),
    );

  let gregorianPlainDate: Temporal.PlainDate;

  try {
    gregorianPlainDate = Temporal.PlainDate.from(
      {
        calendar: calendarSystem,
        year: readField('year'),
        month: readField('month'),
        day: readField('day'),
      },
      { overflow: 'reject' },
    ).withCalendar('iso8601');
  } catch {
    return null;
  }

  const gregorianFieldValues = {
    year: String(gregorianPlainDate.year).padStart(4, '0'),
    month: String(gregorianPlainDate.month).padStart(2, '0'),
    day: String(gregorianPlainDate.day).padStart(2, '0'),
  };

  return (
    Object.keys(fieldIndexes) as (keyof typeof DATE_INPUT_FIELD_TOKENS)[]
  ).reduce(
    (gregorianDateInput, field) =>
      gregorianDateInput.slice(0, fieldIndexes[field]) +
      gregorianFieldValues[field] +
      gregorianDateInput.slice(
        fieldIndexes[field] + DATE_INPUT_FIELD_TOKENS[field].length,
      ),
    dateInput,
  );
};
