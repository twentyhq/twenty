export const getSafeScaleForCurrencyInput = (
  value: string,
  decimals = 0,
): number => {
  const parts = value.split('.');
  const decimalsInValue = parts.length > 1 ? parts[1].length : 0;

  return Math.max(decimals, decimalsInValue);
};
