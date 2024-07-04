import { DateFormat } from '@/workspace-member/constants/DateFormat';
import { detectDateFormat } from '@/workspace-member/utils/detectDateFormat';
import { WorkspaceMemberDateFormat } from '~/generated/graphql';

export const getDateFormatFromWorkspaceEnum = (
  dateLabel: WorkspaceMemberDateFormat,
) => {
  switch (dateLabel) {
    case WorkspaceMemberDateFormat.System:
      return detectDateFormat();
    case WorkspaceMemberDateFormat.MonthFirst:
      return DateFormat.MONTH_FIRST;
    case WorkspaceMemberDateFormat.DayFirst:
      return DateFormat.DAY_FIRST;
    case WorkspaceMemberDateFormat.YearFirst:
      return DateFormat.YEAR_FIRST;
    default:
      return DateFormat.MONTH_FIRST;
  }
};

export const getWorkspaceEnumFromDateFormat = (dateLabel: DateFormat) => {
  switch (dateLabel) {
    case DateFormat.SYSTEM:
      return WorkspaceMemberDateFormat.System;
    case DateFormat.MONTH_FIRST:
      return WorkspaceMemberDateFormat.MonthFirst;
    case DateFormat.DAY_FIRST:
      return WorkspaceMemberDateFormat.DayFirst;
    case DateFormat.YEAR_FIRST:
      return WorkspaceMemberDateFormat.YearFirst;
    default:
      return WorkspaceMemberDateFormat.MonthFirst;
  }
};
