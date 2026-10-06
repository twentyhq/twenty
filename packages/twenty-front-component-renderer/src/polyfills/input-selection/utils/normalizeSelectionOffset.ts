export const normalizeSelectionOffset = (offset: unknown): number => {
  if (typeof offset === 'bigint') {
    throw new TypeError('Cannot convert a BigInt value to a number');
  }

  return Number(offset) >>> 0;
};
