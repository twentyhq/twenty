import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { NumberFormat } from '@/localization/constants/NumberFormat';
import { detectNumberFormat } from '@/localization/utils/detection/detectNumberFormat';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { WorkspaceMemberNumberFormatEnum } from '~/generated/graphql';

export const getNumberFormatFromWorkspaceMember = (
  workspaceMember: WorkspaceMember | CurrentWorkspaceMember,
): NumberFormat => {
  switch (workspaceMember.numberFormat) {
    case WorkspaceMemberNumberFormatEnum.SYSTEM:
      return NumberFormat[detectNumberFormat()];
    case WorkspaceMemberNumberFormatEnum.COMMAS_AND_DOT:
      return NumberFormat.COMMAS_AND_DOT;
    case WorkspaceMemberNumberFormatEnum.SPACES_AND_COMMA:
      return NumberFormat.SPACES_AND_COMMA;
    case WorkspaceMemberNumberFormatEnum.DOTS_AND_COMMA:
      return NumberFormat.DOTS_AND_COMMA;
    case WorkspaceMemberNumberFormatEnum.APOSTROPHE_AND_DOT:
      return NumberFormat.APOSTROPHE_AND_DOT;
    default:
      return NumberFormat[detectNumberFormat()];
  }
};
