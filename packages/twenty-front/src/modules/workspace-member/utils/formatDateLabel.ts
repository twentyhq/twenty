import { DateFormat } from '@/workspace-member/constants/DateFormat';
import { detectDateFormat } from '@/workspace-member/utils/detectDateFormat';
import { WorkspaceMemberDateFormatEnum } from '~/generated/graphql';

export const getDateFormatFromWorkspaceEnum = (
  dateLabel: WorkspaceMemberDateFormatEnum,
) => {
  switch (dateLabel) {
    case WorkspaceMemberDateFormatEnum.System:
      return detectDateFormat();
    case WorkspaceMemberDateFormatEnum.MmmDYyyy:
      return DateFormat.MONTH_FIRST;
    case WorkspaceMemberDateFormatEnum.DMmmYyyy:
      return DateFormat.DAY_FIRST;
    case WorkspaceMemberDateFormatEnum.YyyyMmmD:
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
      return WorkspaceMemberDateFormatEnum.MmmDYyyy;
    case DateFormat.DAY_FIRST:
      return WorkspaceMemberDateFormatEnum.DMmmYyyy;
    case DateFormat.YEAR_FIRST:
      return WorkspaceMemberDateFormatEnum.YyyyMmmD;
    default:
      return WorkspaceMemberDateFormatEnum.MmmDYyyy;
  }
};
