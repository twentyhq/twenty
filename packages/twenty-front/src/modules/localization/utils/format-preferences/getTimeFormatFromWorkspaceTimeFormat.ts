import { TimeFormat } from '@/localization/constants/TimeFormat';
import { detectTimeFormat } from '@/localization/utils/detection/detectTimeFormat';
import { WorkspaceMemberTimeFormatEnum } from '~/generated/graphql';

export const getTimeFormatFromWorkspaceTimeFormat = (
  workspaceTimeFormat: WorkspaceMemberTimeFormatEnum,
) => {
  switch (workspaceTimeFormat) {
    case WorkspaceMemberTimeFormatEnum.SYSTEM:
      return TimeFormat[detectTimeFormat()];
    case WorkspaceMemberTimeFormatEnum.HOUR_24:
      return TimeFormat.HOUR_24;
    case WorkspaceMemberTimeFormatEnum.HOUR_12:
      return TimeFormat.HOUR_12;
    default:
      return TimeFormat.HOUR_24;
  }
};
