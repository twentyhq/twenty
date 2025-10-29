export const formatToShortNumber = (amount: number) => {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);

  if (abs < 1000) {
    return sign + abs.toFixed(1).replace(/\.?0+$/, '');
  } else if (abs < 1_000_000) {
    return sign + (abs / 1000).toFixed(1).replace(/\.?0+$/, '') + 'k';
  } else if (abs < 1_000_000_000) {
    return sign + (abs / 1_000_000).toFixed(1).replace(/\.?0+$/, '') + 'm';
  } else {
    return sign + (abs / 1_000_000_000).toFixed(1).replace(/\.?0+$/, '') + 'b';
  }
};
