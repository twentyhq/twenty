export const DEFAULT_DECIMAL_VALUE = 0;

import { NumberFormat } from '@/localization/constants/NumberFormat';
import { detectNumberFormat } from '@/localization/utils/detectNumberFormat';

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

  const resolvedFormat =
    numberFormat === NumberFormat.SYSTEM ? detectNumberFormat() : numberFormat;

  switch (resolvedFormat) {
    case NumberFormat.COMMAS_AND_DOT:
      return new Intl.NumberFormat('en-US', options).format(value);

    case NumberFormat.SPACES_AND_COMMA:
      return new Intl.NumberFormat('fr-FR', options).format(value);

    case NumberFormat.DOTS_AND_COMMA:
      return new Intl.NumberFormat('de-DE', options).format(value);

    case NumberFormat.APOSTROPHE_AND_DOT:
      return new Intl.NumberFormat('de-CH', options).format(value);

    default:
      return new Intl.NumberFormat('en-US', options).format(value);
  }
};
