import { NumberFormat } from '@/localization/constants/NumberFormat';
import { WorkspaceMemberNumberFormatEnum } from '~/generated/graphql';

export const getNumberFormatFromWorkspaceNumberFormat = (
  numberFormat: WorkspaceMemberNumberFormatEnum,
): NumberFormat => {
  switch (numberFormat) {
    case WorkspaceMemberNumberFormatEnum.SYSTEM:
      return NumberFormat.SYSTEM;
    case WorkspaceMemberNumberFormatEnum.COMMAS_AND_DOT:
      return NumberFormat.COMMAS_AND_DOT;
    case WorkspaceMemberNumberFormatEnum.SPACES_AND_COMMA:
      return NumberFormat.SPACES_AND_COMMA;
    case WorkspaceMemberNumberFormatEnum.SPACES_AND_DOT:
      return NumberFormat.SPACES_AND_DOT;
    default:
      return NumberFormat.COMMAS_AND_DOT;
  }
};

export const getWorkspaceNumberFormatFromNumberFormat = (
  value: NumberFormat,
): WorkspaceMemberNumberFormatEnum => {
  switch (value) {
    case NumberFormat.SYSTEM:
      return WorkspaceMemberNumberFormatEnum.SYSTEM;
    case NumberFormat.COMMAS_AND_DOT:
      return WorkspaceMemberNumberFormatEnum.COMMAS_AND_DOT;
    case NumberFormat.SPACES_AND_COMMA:
      return WorkspaceMemberNumberFormatEnum.SPACES_AND_COMMA;
    case NumberFormat.SPACES_AND_DOT:
      return WorkspaceMemberNumberFormatEnum.SPACES_AND_DOT;
    default:
      return WorkspaceMemberNumberFormatEnum.COMMAS_AND_DOT;
  }
};
