import { type DateFormat } from '@/localization/constants/DateFormat';

type DateFormatWithoutYear = {
  [K in keyof typeof DateFormat]: string;
};
export const DATE_FORMAT_WITHOUT_YEAR: DateFormatWithoutYear = {
  SYSTEM: 'SYSTEM',
  MONTH_FIRST: 'MMM d',
  DAY_FIRST: 'd MMM',
  YEAR_FIRST: 'MMM d',
};
