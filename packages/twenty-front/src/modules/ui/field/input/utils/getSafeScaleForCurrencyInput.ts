export const getSafeScaleForCurrencyInput = (
  value: string,
  decimals = 0,
  radix = '.',
): number => {
  const parts = value.includes(radix)
    ? value.split(radix)
    : value.split('.');
  const decimalsInValue = parts.length > 1 ? parts[1].length : 0;

  return Math.max(decimals, decimalsInValue);
};
