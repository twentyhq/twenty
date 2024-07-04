import { TimeFormat } from '@/workspace-member/constants/TimeFormat';
import { detectTimeFormat } from '@/workspace-member/utils/detectTimeFormat';
import { WorkspaceMemberTimeFormat } from '~/generated/graphql';

export const getTimeFormatFromWorkspaceEnum = (
  timeFormat: WorkspaceMemberTimeFormat,
) => {
  switch (timeFormat) {
    case WorkspaceMemberTimeFormat.System:
      return detectTimeFormat();
    case WorkspaceMemberTimeFormat.Hour_24:
      return TimeFormat.HOUR_24;
    case WorkspaceMemberTimeFormat.Hour_12:
      return TimeFormat.HOUR_12;
    default:
      return TimeFormat.HOUR_24;
  }
};

export const getWorkspaceEnumFromTimeFormat = (timeFormat: TimeFormat) => {
  switch (timeFormat) {
    case TimeFormat.SYSTEM:
      return WorkspaceMemberTimeFormat.System;
    case TimeFormat.HOUR_24:
      return WorkspaceMemberTimeFormat.Hour_24;
    case TimeFormat.HOUR_12:
      return WorkspaceMemberTimeFormat.Hour_12;
    default:
      return WorkspaceMemberTimeFormat.Hour_24;
  }
};
