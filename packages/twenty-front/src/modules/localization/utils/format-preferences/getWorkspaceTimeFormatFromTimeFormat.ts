import { TimeFormat } from '@/localization/constants/TimeFormat';
import { WorkspaceMemberTimeFormatEnum } from '~/generated/graphql';

export const getWorkspaceTimeFormatFromTimeFormat = (
  timeFormat: TimeFormat,
) => {
  switch (timeFormat) {
    case TimeFormat.SYSTEM:
      return WorkspaceMemberTimeFormatEnum.SYSTEM;
    case TimeFormat.HOUR_24:
      return WorkspaceMemberTimeFormatEnum.HOUR_24;
    case TimeFormat.HOUR_12:
      return WorkspaceMemberTimeFormatEnum.HOUR_12;
    default:
      return WorkspaceMemberTimeFormatEnum.HOUR_24;
  }
};
