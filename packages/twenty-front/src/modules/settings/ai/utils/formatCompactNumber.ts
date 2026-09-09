import { formatNumber } from '~/utils/format/formatNumber';

export const formatCompactNumber = (value: number, decimals?: number): string =>
  formatNumber(value, { abbreviate: true, decimals }).replace(/k$/, 'K');
