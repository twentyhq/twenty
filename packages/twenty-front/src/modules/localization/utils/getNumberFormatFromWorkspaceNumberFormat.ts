import { detectNumberFormat } from '@/localization/utils/detectNumberFormat';
import { type NumberFormat } from '@/localization/constants/NumberFormat';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

export const getNumberFormatFromWorkspaceNumberFormat = (
  workspaceMember: Pick<WorkspaceMember, 'numberFormat'>,
): keyof typeof NumberFormat => {
  // If the user has selected SYSTEM, detect the format from the browser
  if (workspaceMember.numberFormat === 'SYSTEM') {
    return detectNumberFormat();
  }

  // Otherwise, use the user's explicit preference
  return workspaceMember.numberFormat ?? 'COMMAS_AND_DOT';
};