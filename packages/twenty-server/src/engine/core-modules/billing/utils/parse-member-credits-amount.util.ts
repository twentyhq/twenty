/* @license Enterprise */

import { isString } from '@sniptt/guards';

const DIGITS_ONLY_PATTERN = /^\d+$/;

// Never throws: it runs while computing the subscription cache entry, which every usage check reads
export const parseMemberCreditsAmount = (value: unknown): number | null => {
  if (!isString(value) || !DIGITS_ONLY_PATTERN.test(value)) {
    return null;
  }

  const amountMicro = Number(value);

  return Number.isSafeInteger(amountMicro) && amountMicro > 0
    ? amountMicro
    : null;
};
