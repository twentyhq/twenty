import { isDefined } from 'twenty-shared/utils';

// Must match backend wire format from get-group-by-expression.util.ts:
// - DAY / MONTH / QUARTER / YEAR / WEEK → TO_CHAR(..., 'YYYY-MM-DD') after DATE_TRUNC
// - DAY_OF_THE_WEEK → TO_CHAR(..., 'TMDay') → English full day name
// - MONTH_OF_THE_YEAR → TO_CHAR(..., 'TMMonth') → English full month name
// - QUARTER_OF_THE_YEAR → TO_CHAR(..., '"Q"Q') → Q1..Q4
const ENGLISH_DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

const ENGLISH_MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const toUtcDateParts = (dateValue: Date) => ({
  year: dateValue.getUTCFullYear(),
  month: dateValue.getUTCMonth(),
  day: dateValue.getUTCDate(),
  dayOfWeek: dateValue.getUTCDay(),
});

const formatUtcYyyyMmDd = (
  year: number,
  monthIndex: number,
  day: number,
): string => {
  const month = String(monthIndex + 1).padStart(2, '0');
  const dayOfMonth = String(day).padStart(2, '0');

  return `${year}-${month}-${dayOfMonth}`;
};

export const normalizeGroupByDimensionValue = (
  value: any,
  fieldConfig: boolean | Record<string, string> | undefined,
): string => {
  if (typeof fieldConfig === 'object' && isDefined(fieldConfig.granularity)) {
    const dateValue = new Date(value);
    const granularity = fieldConfig.granularity;
    const { year, month, day, dayOfWeek } = toUtcDateParts(dateValue);

    // TODO: prefer the groupBy query timezone once available on fieldConfig
    // (backend DATE_TRUNC uses IANA timezone for DATE_TIME fields).
    switch (granularity) {
      case 'DAY':
        return formatUtcYyyyMmDd(year, month, day);
      case 'MONTH':
        // DATE_TRUNC('month') → first day of month as YYYY-MM-DD
        return formatUtcYyyyMmDd(year, month, 1);
      case 'QUARTER': {
        const quarterStartMonth = Math.floor(month / 3) * 3;

        return formatUtcYyyyMmDd(year, quarterStartMonth, 1);
      }
      case 'YEAR':
        // DATE_TRUNC('year') → Jan 1 as YYYY-MM-DD
        return formatUtcYyyyMmDd(year, 0, 1);
      case 'WEEK': {
        // Align with Postgres DATE_TRUNC('week') default (Monday start, ISO-like).
        // dayOfWeek: 0=Sun .. 6=Sat; days since Monday:
        const daysSinceMonday = (dayOfWeek + 6) % 7;
        const weekStart = new Date(
          Date.UTC(year, month, day - daysSinceMonday),
        );

        return formatUtcYyyyMmDd(
          weekStart.getUTCFullYear(),
          weekStart.getUTCMonth(),
          weekStart.getUTCDate(),
        );
      }
      case 'DAY_OF_THE_WEEK':
        return ENGLISH_DAY_NAMES[dayOfWeek];
      case 'MONTH_OF_THE_YEAR':
        return ENGLISH_MONTH_NAMES[month];
      case 'QUARTER_OF_THE_YEAR':
        return `Q${Math.floor(month / 3) + 1}`;
      default:
        return String(value);
    }
  }

  if (typeof value === 'object' && value !== null) {
    return value.id ? String(value.id) : JSON.stringify(value);
  }

  return String(value);
};
