import { DateFormat } from '@/localization/constants/DateFormat';
import { WorkspaceMemberDateFormatEnum } from '~/generated/graphql';

export const getWorkspaceDateFormatFromDateFormat = (
  dateFormat: DateFormat,
) => {
  switch (dateFormat) {
    case DateFormat.SYSTEM:
      return WorkspaceMemberDateFormatEnum.SYSTEM;
    case DateFormat.MONTH_FIRST:
      return WorkspaceMemberDateFormatEnum.MONTH_FIRST;
    case DateFormat.DAY_FIRST:
      return WorkspaceMemberDateFormatEnum.DAY_FIRST;
    case DateFormat.YEAR_FIRST:
      return WorkspaceMemberDateFormatEnum.YEAR_FIRST;
    default:
      return WorkspaceMemberDateFormatEnum.MONTH_FIRST;
  }
};
