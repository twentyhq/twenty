import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { detectTimeFormat } from '@/localization/utils/detection/detectTimeFormat';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { WorkspaceMemberTimeFormatEnum } from '~/generated/graphql';

export const getTimeFormatFromWorkspaceMember = (
  workspaceMember: WorkspaceMember | CurrentWorkspaceMember,
): TimeFormat => {
  switch (workspaceMember.timeFormat) {
    case WorkspaceMemberTimeFormatEnum.SYSTEM:
      return TimeFormat[detectTimeFormat()];
    case WorkspaceMemberTimeFormatEnum.HOUR_24:
      return TimeFormat.HOUR_24;
    case WorkspaceMemberTimeFormatEnum.HOUR_12:
      return TimeFormat.HOUR_12;
    default:
      return TimeFormat[detectTimeFormat()];
  }
};
