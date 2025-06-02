import { DateFormat } from '~/modules/localization/constants/DateFormat';

export const getDateMask = (dateFormat: DateFormat): string => {
  switch (dateFormat) {
    case DateFormat.DAY_FIRST:
      return 'd`/m`/Y`';
    case DateFormat.YEAR_FIRST:
      return 'Y`-m`-d`';
    case DateFormat.MONTH_FIRST:
    default:
      return 'm`/d`/Y`';
  }
};
