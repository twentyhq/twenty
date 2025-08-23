import { isDefined } from 'twenty-shared/utils';
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

  if (displayType === 'custom' && isDefined(customFormatter)) {
    return customFormatter(value);
  }

  switch (displayType) {
    case 'percentage':
      return `${formatNumber(value * 100, decimals)}%`;

    case 'shortNumber':
      return `${prefix}${formatAmount(value)}${suffix}`;

    case 'currency': {
      const currencyPrefix = prefix || '$';
      return `${currencyPrefix}${formatNumber(value, decimals)}${suffix}`;
    }

    case 'number':
    default:
      return `${prefix}${formatNumber(value, decimals)}${suffix}`;
  }
};
