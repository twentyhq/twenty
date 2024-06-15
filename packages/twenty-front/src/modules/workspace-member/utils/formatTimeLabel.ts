import { TimeFormat } from '@/workspace-member/constants/TimeFormat';
import { detectTimeFormat } from '@/workspace-member/utils/detectTimeFormat';
import { WorkspaceMemberTimeFormatEnum } from '~/generated/graphql';

export const getTimeFormatFromWorkspaceEnum = (
  timeFormat: WorkspaceMemberTimeFormatEnum,
) => {
  switch (timeFormat) {
    case WorkspaceMemberTimeFormatEnum.System:
      return detectTimeFormat();
    case WorkspaceMemberTimeFormatEnum.HhMm:
      return TimeFormat.MILITARY;
    case WorkspaceMemberTimeFormatEnum.HMmAa:
      return TimeFormat.STANDARD;
    default:
      return TimeFormat.MILITARY;
  }
};

export const getWorkspaceEnumFromTimeFormat = (timeFormat: TimeFormat) => {
  switch (timeFormat) {
    case TimeFormat.SYSTEM:
      return WorkspaceMemberTimeFormatEnum.System;
    case TimeFormat.MILITARY:
      return WorkspaceMemberTimeFormatEnum.HhMm;
    case TimeFormat.STANDARD:
      return WorkspaceMemberTimeFormatEnum.HMmAa;
    default:
      return WorkspaceMemberTimeFormatEnum.HhMm;
  }
};
