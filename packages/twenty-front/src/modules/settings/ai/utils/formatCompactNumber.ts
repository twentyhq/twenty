import {
  DEFAULT_DECIMAL_VALUE,
  formatNumber,
} from '~/utils/format/formatNumber';

export const formatCompactNumber = (
  value: number,
  decimals = DEFAULT_DECIMAL_VALUE,
): string =>
  formatNumber(value, { abbreviate: true, decimals }).replace(/k$/, 'K');
