import { TimeFormat } from '@/workspace-member/constants/TimeFormat';
import { detectTimeFormat } from '@/workspace-member/utils/detectTimeFormat';
import { WorkspaceMemberTimeFormatEnum } from '~/generated/graphql';

export const getTimeFormatFromWorkspaceEnum = (
  timeFormat: WorkspaceMemberTimeFormatEnum,
) => {
  switch (timeFormat) {
    case WorkspaceMemberTimeFormatEnum.System:
      return detectTimeFormat();
    case WorkspaceMemberTimeFormatEnum.Hour_24:
      return TimeFormat.HOUR_24;
    case WorkspaceMemberTimeFormatEnum.Hour_12:
      return TimeFormat.HOUR_12;
    default:
      return TimeFormat.HOUR_24;
  }
};

export const getWorkspaceEnumFromTimeFormat = (timeFormat: TimeFormat) => {
  switch (timeFormat) {
    case TimeFormat.SYSTEM:
      return WorkspaceMemberTimeFormatEnum.System;
    case TimeFormat.HOUR_24:
      return WorkspaceMemberTimeFormatEnum.Hour_24;
    case TimeFormat.HOUR_12:
      return WorkspaceMemberTimeFormatEnum.Hour_12;
    default:
      return WorkspaceMemberTimeFormatEnum.Hour_24;
  }
};
