export type AmountFormat = 'short' | 'full';

export const formatAmount = (amount: number, format: AmountFormat = 'short') => {
  if (format === 'full') {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  if (amount < 1000) {
    return amount.toFixed(1).replace(/\.?0+$/, '');
  } else if (amount < 1000000) {
    return (amount / 1000).toFixed(1).replace(/\.?0+$/, '') + 'k';
  } else if (amount < 1000000000) {
    return (amount / 1000000).toFixed(1).replace(/\.?0+$/, '') + 'm';
  } else {
    return (amount / 1000000000).toFixed(1).replace(/\.?0+$/, '') + 'b';
  }
};
