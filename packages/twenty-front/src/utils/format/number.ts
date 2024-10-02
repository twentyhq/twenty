export const DEFAULT_DECIMAL_VALUE = 0;

export const formatNumber = (value: number, decimals?: number): string => {
  return value.toFixed(decimals ?? DEFAULT_DECIMAL_VALUE);
};
