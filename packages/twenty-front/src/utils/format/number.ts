export const DEFAULT_DECIMAL_VALUE = 0;

import { NumberFormat } from '@/localization/constants/NumberFormat';

export const formatNumber = (value: number, decimals?: number): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals ?? DEFAULT_DECIMAL_VALUE,
    maximumFractionDigits: decimals ?? DEFAULT_DECIMAL_VALUE,
  });
};

export const formatNumberLocalized = (
  value: number,
  numberFormat: NumberFormat,
  decimals?: number,
): string => {
  const options = {
    maximumFractionDigits: decimals !== undefined ? decimals : 0,
    minimumFractionDigits: decimals !== undefined ? decimals : 0,
  };

  switch (numberFormat) {
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
