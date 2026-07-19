import { i18n } from '@lingui/core';
import { isDefined } from 'twenty-shared/utils';

const capitalize = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);

const formatDatePart = (
  dateValue: Date,
  options: Intl.DateTimeFormatOptions,
): string =>
  capitalize(
    new Intl.DateTimeFormat(i18n.locale || undefined, {
      ...options,
      timeZone: 'UTC',
    }).format(dateValue),
  );

const getDateParts = (
  value: unknown,
  dateValue: Date,
  timeZone?: string,
): { year: number; month: number; day: number } => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);

    return { year, month, day };
  }

  const dateParts = new Intl.DateTimeFormat('en-US', {
    timeZone: timeZone || 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(dateValue);
  const getPartValue = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(dateParts.find((part) => part.type === type)?.value);

  return {
    year: getPartValue('year'),
    month: getPartValue('month'),
    day: getPartValue('day'),
  };
};

export const normalizeGroupByDimensionValue = (
  value: any,
  fieldConfig: boolean | Record<string, string> | undefined,
): string => {
  if (typeof fieldConfig === 'object' && isDefined(fieldConfig.granularity)) {
    const dateValue = new Date(value);

    if (Number.isNaN(dateValue.getTime())) {
      return String(value);
    }

    const { year, month, day } = getDateParts(
      value,
      dateValue,
      fieldConfig.timeZone,
    );
    const dateDimensionValue = [
      year,
      String(month).padStart(2, '0'),
      String(day).padStart(2, '0'),
    ].join('-');
    const granularity = fieldConfig.granularity;

    switch (granularity) {
      case 'DAY':
        return dateDimensionValue;
      case 'WEEK': {
        const weekStartDay = fieldConfig.weekStartDay;
        const dayOfWeek = new Date(
          Date.UTC(year, month - 1, day),
        ).getUTCDay();
        const dayOffset =
          weekStartDay === 'SUNDAY'
            ? dayOfWeek
            : weekStartDay === 'SATURDAY'
              ? (dayOfWeek + 1) % 7
              : (dayOfWeek + 6) % 7;
        const weekStartDate = new Date(Date.UTC(year, month - 1, day));

        weekStartDate.setUTCDate(weekStartDate.getUTCDate() - dayOffset);

        return weekStartDate.toISOString().split('T')[0];
      }
      case 'MONTH':
        return `${year}-${String(month).padStart(2, '0')}-01`;
      case 'QUARTER': {
        const quarterStartMonth = Math.floor((month - 1) / 3) * 3 + 1;

        return `${year}-${String(quarterStartMonth).padStart(2, '0')}-01`;
      }
      case 'YEAR':
        return `${year}-01-01`;
      case 'DAY_OF_THE_WEEK':
        return formatDatePart(dateValue, { weekday: 'long' });
      case 'MONTH_OF_THE_YEAR':
        return formatDatePart(dateValue, { month: 'long' });
      case 'QUARTER_OF_THE_YEAR':
        return `Q${Math.floor((month - 1) / 3) + 1}`;
      default:
        return String(value);
    }
  }

  if (typeof value === 'object' && value !== null) {
    return value.id ? String(value.id) : JSON.stringify(value);
  }

  return String(value);
};
