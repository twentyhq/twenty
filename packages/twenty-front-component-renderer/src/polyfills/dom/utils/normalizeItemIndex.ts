export const normalizeItemIndex = (index: number): number => {
  const numericIndex = Number(index);

  if (!Number.isFinite(numericIndex)) {
    return 0;
  }

  return Math.trunc(numericIndex) >>> 0;
};
