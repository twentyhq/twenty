import { isBigInt } from '@sniptt/guards';

export const normalizeSelectionOffset = (offset: unknown): number => {
  if (isBigInt(offset)) {
    throw new TypeError('Cannot convert a BigInt value to a number');
  }

  return Number(offset) >>> 0;
};
