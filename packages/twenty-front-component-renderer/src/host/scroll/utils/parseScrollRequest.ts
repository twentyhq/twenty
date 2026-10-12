import { isNumber, isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { SCROLL_INTO_VIEW_ALIGNMENTS } from '@/constants/ScrollIntoViewAlignments';
import { type ScrollAxisOffsets } from '@/types/ScrollAxisOffsets';
import { type ScrollIntoViewAlignment } from '@/types/ScrollIntoViewAlignment';
import { type ScrollRequest } from '@/types/ScrollRequest';

const readFiniteNumber = (value: unknown): number | undefined =>
  isNumber(value) && Number.isFinite(value) ? value : undefined;

const isScrollIntoViewAlignment = (
  value: unknown,
): value is ScrollIntoViewAlignment =>
  isString(value) &&
  SCROLL_INTO_VIEW_ALIGNMENTS.some((alignment) => alignment === value);

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
