import { NumberFormat } from '@/localization/constants/NumberFormat';
import { WorkspaceMemberNumberFormatEnum } from '~/generated/graphql';

export const getWorkspaceNumberFormatFromNumberFormat = (
  numberFormat: NumberFormat,
): WorkspaceMemberNumberFormatEnum => {
  switch (numberFormat) {
    case NumberFormat.SYSTEM:
      return WorkspaceMemberNumberFormatEnum.SYSTEM;
    case NumberFormat.COMMAS_AND_DOT:
      return WorkspaceMemberNumberFormatEnum.COMMAS_AND_DOT;
    case NumberFormat.SPACES_AND_COMMA:
      return WorkspaceMemberNumberFormatEnum.SPACES_AND_COMMA;
    case NumberFormat.DOTS_AND_COMMA:
      return WorkspaceMemberNumberFormatEnum.DOTS_AND_COMMA;
    case NumberFormat.APOSTROPHE_AND_DOT:
      return WorkspaceMemberNumberFormatEnum.APOSTROPHE_AND_DOT;
    default:
      return WorkspaceMemberNumberFormatEnum.COMMAS_AND_DOT;
  }
};
