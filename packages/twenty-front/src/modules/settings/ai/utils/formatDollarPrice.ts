import { formatNumber } from '~/utils/format/formatNumber';

export const formatDollarPrice = (dollars: number): string => {
  if (dollars === 0) {
    return '$0';
  }

  if (Math.abs(dollars) < 0.01) {
    return `$${formatNumber(dollars, { decimals: 4 })}`;
  }

  return `$${formatNumber(dollars, { decimals: 2 })}`;
};
