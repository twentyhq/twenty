import { isNumber } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type ScrollAxisOffsets } from '@/types/ScrollAxisOffsets';
import { type ScrollRequest } from '@/types/ScrollRequest';
import { isScrollIntoViewAlignment } from '@/utils/isScrollIntoViewAlignment';

const readFiniteNumber = (value: unknown): number | undefined =>
  isNumber(value) && Number.isFinite(value) ? value : undefined;

const parseScrollAxisOffsets = (
  request: Record<string, unknown>,
): ScrollAxisOffsets | null => {
  const top = readFiniteNumber(request.top);
  const left = readFiniteNumber(request.left);

  if (!isDefined(top) && !isDefined(left)) {
    return null;
  }

  return {
    ...(isDefined(top) && { top }),
    ...(isDefined(left) && { left }),
  };
};

export const parseScrollRequest = (request: unknown): ScrollRequest | null => {
  if (!isPlainObject(request)) {
    return null;
  }

  if (request.method === 'scrollTo') {
    const scrollAxisOffsets = parseScrollAxisOffsets(request);

    return isDefined(scrollAxisOffsets)
      ? { method: 'scrollTo', ...scrollAxisOffsets }
      : null;
  }

  if (
    request.method === 'scrollIntoView' &&
    isScrollIntoViewAlignment(request.block) &&
    isScrollIntoViewAlignment(request.inline)
  ) {
    return {
      method: 'scrollIntoView',
      block: request.block,
      inline: request.inline,
    };
  }

  return null;
};
