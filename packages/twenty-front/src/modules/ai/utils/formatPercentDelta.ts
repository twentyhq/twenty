export const formatPercentDelta = (delta: number): string =>
  `${delta > 0 ? '+' : ''}${delta}%`;
