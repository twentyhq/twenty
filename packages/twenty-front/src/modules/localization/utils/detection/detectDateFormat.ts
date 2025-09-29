import { type DateFormat } from '@/localization/constants/DateFormat';

export const detectDateFormat = (): keyof typeof DateFormat => {
  try {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat(navigator?.language || 'en-US');
    const parts = formatter.formatToParts(date);

    const partOrder = parts
      .filter((part) => ['year', 'month', 'day'].includes(part.type))
      .map((part) => part.type);

    if (partOrder[0] === 'month') return 'MONTH_FIRST';
    if (partOrder[0] === 'day') return 'DAY_FIRST';
    if (partOrder[0] === 'year') return 'YEAR_FIRST';

    return 'MONTH_FIRST';
  } catch {
    return 'MONTH_FIRST';
  }
};
