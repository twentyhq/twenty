export const formatNumber = (value: number): string =>
  value.toLocaleString('en-US', {
    maximumFractionDigits: 7,
  });
