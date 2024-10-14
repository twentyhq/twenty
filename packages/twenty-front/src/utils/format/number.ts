export const DEFAULT_DECIMAL_VALUE = 0;

export const formatNumber = (value: number, decimals?: number): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals ?? DEFAULT_DECIMAL_VALUE,
    maximumFractionDigits: decimals ?? DEFAULT_DECIMAL_VALUE,
  });
};
