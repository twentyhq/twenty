import { CalendarSystem } from '@/localization/constants/CalendarSystem';
import { type Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';

const INTL_MONTH_STYLE_BY_TOKEN_LENGTH: Record<
  number,
  Intl.DateTimeFormatOptions['month']
> = {
  3: 'short',
  4: 'long',
  5: 'narrow',
};

const toQuotedLiteral = (value: string) => `'${value.replaceAll("'", "''")}'`;

const formatMonthName = ({
  plainDate,
  calendarSystem,
  monthStyle,
  localeCode,
}: {
  plainDate: Temporal.PlainDate;
  calendarSystem: CalendarSystem;
  monthStyle: Intl.DateTimeFormatOptions['month'];
  localeCode?: string;
}) =>
  new Intl.DateTimeFormat(localeCode, {
    calendar: calendarSystem,
    month: monthStyle,
    timeZone: 'UTC',
  }).format(
    new Date(Date.UTC(plainDate.year, plainDate.month - 1, plainDate.day, 12)),
  );

const localizeToken = ({
  token,
  plainDate,
  calendarPlainDate,
  calendarSystem,
  localeCode,
}: {
  token: string;
  plainDate: Temporal.PlainDate;
  calendarPlainDate: Temporal.PlainDate;
  calendarSystem: CalendarSystem;
  localeCode?: string;
}): string | undefined => {
  switch (token[0]) {
    case 'y':
      return token.length === 2
        ? String(calendarPlainDate.year % 100).padStart(2, '0')
        : String(calendarPlainDate.year).padStart(token.length, '0');
    case 'M':
    case 'L': {
      const monthStyle = INTL_MONTH_STYLE_BY_TOKEN_LENGTH[token.length];

      if (isDefined(monthStyle)) {
        return formatMonthName({
          plainDate,
          calendarSystem,
          monthStyle,
          localeCode,
        });
      }

      return String(calendarPlainDate.month).padStart(token.length, '0');
    }
    case 'd':
      return String(calendarPlainDate.day).padStart(token.length, '0');
    default:
      return undefined;
  }
};

// date-fns only knows the Gregorian calendar, so calendar-dependent tokens
// are resolved here and handed back to date-fns as quoted literals.
export const localizeDateFormatToCalendarSystem = ({
  dateFormat,
  plainDate,
  calendarSystem,
  localeCode,
}: {
  dateFormat: string;
  plainDate: Temporal.PlainDate;
  calendarSystem: CalendarSystem;
  localeCode?: string;
}): string => {
  if (calendarSystem === CalendarSystem.GREGORIAN) {
    return dateFormat;
  }

  const calendarPlainDate = plainDate.withCalendar(calendarSystem);

  let localizedDateFormat = '';
  let index = 0;

  while (index < dateFormat.length) {
    const character = dateFormat[index];

    if (character === "'") {
      let closingIndex = index + 1;

      while (closingIndex < dateFormat.length) {
        if (dateFormat[closingIndex] === "'") {
          if (dateFormat[closingIndex + 1] === "'") {
            closingIndex += 2;
            continue;
          }
          break;
        }
        closingIndex++;
      }

      localizedDateFormat += dateFormat.slice(index, closingIndex + 1);
      index = closingIndex + 1;
      continue;
    }

    let tokenEndIndex = index + 1;

    if (/[a-zA-Z]/.test(character)) {
      while (dateFormat[tokenEndIndex] === character) {
        tokenEndIndex++;
      }
    }

    const token = dateFormat.slice(index, tokenEndIndex);
    const localizedToken = localizeToken({
      token,
      plainDate,
      calendarPlainDate,
      calendarSystem,
      localeCode,
    });

    localizedDateFormat += isDefined(localizedToken)
      ? toQuotedLiteral(localizedToken)
      : token;
    index = tokenEndIndex;
  }

  return localizedDateFormat;
};
