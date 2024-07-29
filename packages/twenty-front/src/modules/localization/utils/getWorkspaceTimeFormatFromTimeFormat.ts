import { TimeFormat } from '@/localization/constants/TimeFormat';
import { WorkspaceMemberTimeFormatEnum } from '~/generated/graphql';

export const getWorkspaceTimeFormatFromTimeFormat = (
  timeFormat: TimeFormat,
) => {
  switch (timeFormat) {
    case TimeFormat.BROWSER:
      return WorkspaceMemberTimeFormatEnum.Browser;
    case TimeFormat.HOUR_24:
      return WorkspaceMemberTimeFormatEnum.Hour_24;
    case TimeFormat.HOUR_12:
      return WorkspaceMemberTimeFormatEnum.Hour_12;
    default:
      return WorkspaceMemberTimeFormatEnum.Hour_24;
  }
};
