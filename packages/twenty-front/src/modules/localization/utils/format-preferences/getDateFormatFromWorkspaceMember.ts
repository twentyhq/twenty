import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { DateFormat } from '@/localization/constants/DateFormat';
import { detectDateFormat } from '@/localization/utils/detection/detectDateFormat';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { WorkspaceMemberDateFormatEnum } from '~/generated/graphql';

export const getDateFormatFromWorkspaceMember = (
  workspaceMember: WorkspaceMember | CurrentWorkspaceMember,
): DateFormat => {
  switch (workspaceMember.dateFormat) {
    case WorkspaceMemberDateFormatEnum.SYSTEM:
      return DateFormat[detectDateFormat()];
    case WorkspaceMemberDateFormatEnum.MONTH_FIRST:
      return DateFormat.MONTH_FIRST;
    case WorkspaceMemberDateFormatEnum.DAY_FIRST:
      return DateFormat.DAY_FIRST;
    case WorkspaceMemberDateFormatEnum.YEAR_FIRST:
      return DateFormat.YEAR_FIRST;
    default:
      return DateFormat[detectDateFormat()];
  }
};
