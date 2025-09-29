import { DateFormat } from '@/localization/constants/DateFormat';
import { detectDateFormat } from '@/localization/utils/detection/detectDateFormat';
import { WorkspaceMemberDateFormatEnum } from '~/generated/graphql';

export const getDateFormatFromWorkspaceDateFormat = (
  workspaceDateFormat: WorkspaceMemberDateFormatEnum,
) => {
  switch (workspaceDateFormat) {
    case WorkspaceMemberDateFormatEnum.SYSTEM:
      return DateFormat[detectDateFormat()];
    case WorkspaceMemberDateFormatEnum.MONTH_FIRST:
      return DateFormat.MONTH_FIRST;
    case WorkspaceMemberDateFormatEnum.DAY_FIRST:
      return DateFormat.DAY_FIRST;
    case WorkspaceMemberDateFormatEnum.YEAR_FIRST:
      return DateFormat.YEAR_FIRST;
    default:
      return DateFormat.MONTH_FIRST;
  }
};
