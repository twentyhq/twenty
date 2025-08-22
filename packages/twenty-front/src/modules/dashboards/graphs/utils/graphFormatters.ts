import { formatAmount } from '~/utils/format/formatAmount';
import { formatNumber } from '~/utils/format/number';

export type GraphValueFormatOptions = {
  displayType?: 'percentage' | 'number' | 'shortNumber' | 'currency' | 'custom';
  decimals?: number;
  prefix?: string;
  suffix?: string;
  customFormatter?: (value: number) => string;
};

export const formatGraphValue = (
  value: number,
  options?: GraphValueFormatOptions,
): string => {
  const {
    displayType = 'number',
    decimals,
    prefix = '',
    suffix = '',
    customFormatter,
  } = options || {};

  // Custom formatter takes precedence
  if (displayType === 'custom' && customFormatter) {
    return customFormatter(value);
  }

  // Handle different display types following existing patterns
  switch (displayType) {
    case 'percentage':
      // Percentage always multiplies by 100 and adds %
      return `${formatNumber(value * 100, decimals)}%`;

    case 'shortNumber':
      // Short number uses formatAmount (1k, 1m, 1b) with optional prefix/suffix
      return `${prefix}${formatAmount(value)}${suffix}`;

    case 'currency':
      // Currency defaults to $ if no prefix provided
      const currencyPrefix = prefix || '$';
      return `${currencyPrefix}${formatNumber(value, decimals)}${suffix}`;

    case 'number':
    default:
      // Regular number formatting with optional prefix/suffix
      return `${prefix}${formatNumber(value, decimals)}${suffix}`;
  }
};