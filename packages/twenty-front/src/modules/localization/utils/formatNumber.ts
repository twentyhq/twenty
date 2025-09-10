import { NumberFormat } from '@/localization/constants/NumberFormat';

export const formatNumber = (
  value: number,
  numberFormat: NumberFormat,
): string => {
  switch (numberFormat) {
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

    case NumberFormat.MAGNITUDE_SUFFIXES:
      if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
      if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
      if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}k`;
      return value.toFixed(Math.abs(value) < 1 ? 2 : 0);

    default:
      return new Intl.NumberFormat().format(value);
  }
};
