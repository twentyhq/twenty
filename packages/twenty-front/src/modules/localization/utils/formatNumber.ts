import { NumberFormat } from '@/localization/constants/NumberFormat';

export const formatNumber = (
  value: number,
  numberFormat: NumberFormat,
): string => {
  switch (numberFormat) {
    case NumberFormat.SYSTEM:
      return new Intl.NumberFormat(navigator.language, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value);

    case NumberFormat.COMMAS_AND_DOT:
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value);

    case NumberFormat.SPACES_AND_COMMA:
      return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value);

    case NumberFormat.SPACES_AND_DOT:
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
        .format(value)
        .replace(/,/g, ' ');

    default:
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value);
  }
};
