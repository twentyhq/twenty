import { DateFormat } from '@/localization/constants/DateFormat';
import { doNotTranslate } from 'twenty-shared/i18n';

export const getDateMask = (dateFormat: DateFormat): string => {
  switch (dateFormat) {
    case DateFormat.DAY_FIRST:
      return 'd`/m`/Y`';
    case DateFormat.YEAR_FIRST:
      return doNotTranslate('Y`-m`-d`');
    case DateFormat.MONTH_FIRST:
    default:
      return 'm`/d`/Y`';
  }
};
