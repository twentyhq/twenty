import { DateFormat } from '@/workspace-member/constants/DateFormat';
import { detectDateFormat } from '@/workspace-member/utils/detectDateFormat';
import { WorkspaceMemberDateFormatEnum } from '~/generated/graphql';

export const getDateFormatFromWorkspaceEnum = (
  dateLabel: WorkspaceMemberDateFormatEnum,
) => {
  switch (dateLabel) {
    case WorkspaceMemberDateFormatEnum.System:
      return detectDateFormat();
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

export const getWorkspaceEnumFromDateFormat = (dateLabel: DateFormat) => {
  switch (dateLabel) {
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
