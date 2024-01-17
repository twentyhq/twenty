export const amountFormat = (number: number) => {
  if (number < 1000) {
    return number.toFixed(1).replace(/\.?0+$/, '');
  } else if (number < 1000000) {
    return (number / 1000).toFixed(1).replace(/\.?0+$/, '') + 'k';
  } else if (number < 1000000000) {
    return (number / 1000000).toFixed(1).replace(/\.?0+$/, '') + 'm';
  } else {
    return (number / 1000000000).toFixed(1).replace(/\.?0+$/, '') + 'b';
  }
};
