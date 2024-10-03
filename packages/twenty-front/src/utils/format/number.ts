export const DEFAULT_DECIMAL_VALUE = 0;

export const formatNumber = (value: number, decimals?: number): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals ?? DEFAULT_DECIMAL_VALUE,
  });
};
