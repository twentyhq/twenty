import { TimeFormat } from '@/localization/constants/TimeFormat';
import { detectTimeFormat } from '@/localization/utils/detectTimeFormat';
import { WorkspaceMemberTimeFormatEnum } from '~/generated/graphql';

export const getTimeFormatFromWorkspaceTimeFormat = (
  workspaceTimeFormat: WorkspaceMemberTimeFormatEnum,
) => {
  switch (workspaceTimeFormat) {
    case WorkspaceMemberTimeFormatEnum.System:
      return TimeFormat[detectTimeFormat()];
    case WorkspaceMemberTimeFormatEnum.Hour_24:
      return TimeFormat.HOUR_24;
    case WorkspaceMemberTimeFormatEnum.Hour_12:
      return TimeFormat.HOUR_12;
    default:
      return TimeFormat.HOUR_24;
  }
};
