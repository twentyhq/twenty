import { NumberFormat } from '@/localization/constants/NumberFormat';
import { detectNumberFormat } from '@/localization/utils/detectNumberFormat';

export const formatNumber = (
  value: number,
  numberFormat: NumberFormat,
  decimals?: number,
): string => {
  const actualFormat =
    numberFormat === NumberFormat.SYSTEM ? detectNumberFormat() : numberFormat;

  const options = {
    maximumFractionDigits: decimals !== undefined ? decimals : 0,
    minimumFractionDigits: decimals !== undefined ? decimals : 0,
  };

  switch (actualFormat) {
    case NumberFormat.COMMAS_AND_DOT:
      return new Intl.NumberFormat('en-US', options).format(value);

    case NumberFormat.SPACES_AND_COMMA:
      return new Intl.NumberFormat('fr-FR', options).format(value);

    case NumberFormat.SPACES_AND_DOT: {
      const formatted = new Intl.NumberFormat('en-US', options).format(value);
      return formatted.replace(/,/g, ' ');
    }

    default:
      return new Intl.NumberFormat('en-US', options).format(value);
  }
};
