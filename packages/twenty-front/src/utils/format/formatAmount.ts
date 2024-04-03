export const formatAmount = (amount: number) => {
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
