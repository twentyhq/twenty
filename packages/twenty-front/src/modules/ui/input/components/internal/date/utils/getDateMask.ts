import { DateFormat } from '@/localization/constants/DateFormat';

export const getDateMask = (dateFormat: DateFormat): string => {
  switch (dateFormat) {
    case DateFormat.DAY_FIRST:
      return 'd`/m`/Y`';
    case DateFormat.YEAR_FIRST:
      // oxlint-disable-next-line lingui/no-unlocalized-strings -- This is a time or date input mask token, not natural-language text.
      return 'Y`-m`-d`';
    case DateFormat.MONTH_FIRST:
    default:
      return 'm`/d`/Y`';
  }
};
