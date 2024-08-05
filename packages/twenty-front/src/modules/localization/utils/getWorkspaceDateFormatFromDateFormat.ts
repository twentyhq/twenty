import { DateFormat } from '@/localization/constants/DateFormat';
import { WorkspaceMemberDateFormatEnum } from '~/generated/graphql';

export const getWorkspaceDateFormatFromDateFormat = (
  dateFormat: DateFormat,
) => {
  switch (dateFormat) {
    case DateFormat.SYSTEM:
      return WorkspaceMemberDateFormatEnum.System;
    case DateFormat.MONTH_FIRST:
      return WorkspaceMemberDateFormatEnum.MonthFirst;
    case DateFormat.DAY_FIRST:
      return WorkspaceMemberDateFormatEnum.DayFirst;
    case DateFormat.YEAR_FIRST:
      return WorkspaceMemberDateFormatEnum.YearFirst;
    default:
      return WorkspaceMemberDateFormatEnum.MonthFirst;
  }
};
