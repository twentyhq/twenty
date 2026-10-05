export const normalizeSelectionOffset = (offset: unknown): number =>
  Number(offset) >>> 0;
