export const normalizeScrollOffset = (value: unknown): number => {
  const scrollOffset = Number(value);

  return Number.isFinite(scrollOffset) ? scrollOffset : 0;
};
