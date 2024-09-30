export const formatNumber = (value: number, decimals?: number): string =>
  decimals !== undefined
    ? value.toFixed(decimals)
    : value.toLocaleString('en-US');
