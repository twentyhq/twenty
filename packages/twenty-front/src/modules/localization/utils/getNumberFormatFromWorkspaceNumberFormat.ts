import { NumberFormat } from '@/localization/constants/NumberFormat';
import { type WorkspaceMemberNumberFormatEnum } from '~/generated/graphql';

export const getNumberFormatFromWorkspaceNumberFormat = (
  numberFormat: WorkspaceMemberNumberFormatEnum,
): NumberFormat => {
  if (numberFormat === 'SYSTEM') {
    return NumberFormat.SYSTEM;
  }

  return (
    (numberFormat as unknown as NumberFormat) ?? NumberFormat.COMMAS_AND_DOT
  );
};
