import { NumberFormat } from '@/localization/constants/NumberFormat';
import { detectNumberFormat } from '@/localization/utils/detectNumberFormat';
import { WorkspaceMemberNumberFormatEnum } from '~/generated/graphql';

export const getNumberFormatFromWorkspaceNumberFormat = (
  numberFormat: WorkspaceMemberNumberFormatEnum,
): NumberFormat => {
  switch (numberFormat) {
    case WorkspaceMemberNumberFormatEnum.SYSTEM:
      return NumberFormat[detectNumberFormat()];
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
