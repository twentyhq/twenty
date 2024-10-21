import { DateFormat } from '@/localization/constants/DateFormat';
import { detectDateFormat } from '@/localization/utils/detectDateFormat';
import { WorkspaceMemberDateFormatEnum } from '~/generated/graphql';

export const getDateFormatFromWorkspaceDateFormat = (
  workspaceDateFormat: WorkspaceMemberDateFormatEnum,
) => {
  switch (workspaceDateFormat) {
    case WorkspaceMemberDateFormatEnum.System:
      return DateFormat[detectDateFormat()];
    case WorkspaceMemberDateFormatEnum.MonthFirst:
      return DateFormat.MONTH_FIRST;
    case WorkspaceMemberDateFormatEnum.DayFirst:
      return DateFormat.DAY_FIRST;
    case WorkspaceMemberDateFormatEnum.YearFirst:
      return DateFormat.YEAR_FIRST;
    default:
      return DateFormat.MONTH_FIRST;
  }
};
