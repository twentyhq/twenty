import { isDefined } from 'twenty-shared/utils';
import {
  formatNumber as utilFormatNumber,
  type FormatNumberOptions,
} from '~/utils/format/formatNumber';
import { formatToShortNumber } from '~/utils/format/formatToShortNumber';

export type GraphValueFormatOptions = {
  displayType?: 'percentage' | 'number' | 'shortNumber' | 'currency' | 'custom';
  decimals?: number;
  prefix?: string;
  suffix?: string;
  customFormatter?: (value: number) => string;
  formatNumberFn?: (
    value: number,
    options?: Omit<FormatNumberOptions, 'format'>,
  ) => string;
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
    formatNumberFn,
  } = options || {};

  const formatNumber =
    formatNumberFn ??
    ((v: number, opts?: Omit<FormatNumberOptions, 'format'>) =>
      utilFormatNumber(v, opts));

  if (displayType === 'custom' && isDefined(customFormatter)) {
    return customFormatter(value);
  }

  const sign = value < 0 ? '-' : '';
  const absoluteValue = Math.abs(value);

  switch (displayType) {
    case 'percentage':
      return `${formatNumber(value * 100, { decimals })}%`;

    case 'shortNumber':
      return `${sign}${prefix}${formatToShortNumber(absoluteValue)}${suffix}`;

    case 'currency': {
      const currencyPrefix = prefix || '$';
      return `${sign}${currencyPrefix}${formatNumber(absoluteValue, { decimals })}${suffix}`;
    }

    case 'number':
    default:
      return `${sign}${prefix}${formatNumber(absoluteValue, { decimals })}${suffix}`;
  }
};
