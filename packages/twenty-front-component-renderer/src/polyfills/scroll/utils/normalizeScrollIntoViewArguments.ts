import { isNull, isObject, isUndefined } from '@sniptt/guards';

import { type ScrollIntoViewAlignment } from '@/types/ScrollIntoViewAlignment';
import { type ScrollIntoViewRequest } from '@/types/ScrollIntoViewRequest';
import { isScrollIntoViewAlignment } from '@/utils/isScrollIntoViewAlignment';

type ScrollIntoViewAlignments = Omit<ScrollIntoViewRequest, 'method'>;

const START_ALIGNMENTS: ScrollIntoViewAlignments = {
  block: 'start',
  inline: 'nearest',
};

const END_ALIGNMENTS: ScrollIntoViewAlignments = {
  block: 'end',
  inline: 'nearest',
};

const normalizeScrollIntoViewAlignment = ({
  alignment,
  defaultAlignment,
}: {
  alignment: unknown;
  defaultAlignment: ScrollIntoViewAlignment;
}): ScrollIntoViewAlignment => {
  if (isUndefined(alignment)) {
    return defaultAlignment;
  }

  if (!isScrollIntoViewAlignment(alignment)) {
    throw new TypeError(
      `Failed to execute 'scrollIntoView' on 'Element': The provided value '${String(alignment)}' is not a valid enum value of type ScrollLogicalPosition.`,
    );
  }

  return alignment;
};

export const normalizeScrollIntoViewArguments = (
  scrollIntoViewArgument: unknown,
): ScrollIntoViewAlignments => {
  if (isUndefined(scrollIntoViewArgument) || isNull(scrollIntoViewArgument)) {
    return START_ALIGNMENTS;
  }

  if (!isObject(scrollIntoViewArgument)) {
    return scrollIntoViewArgument ? START_ALIGNMENTS : END_ALIGNMENTS;
  }

  return {
    block: normalizeScrollIntoViewAlignment({
      alignment: Reflect.get(scrollIntoViewArgument, 'block'),
      defaultAlignment: START_ALIGNMENTS.block,
    }),
    inline: normalizeScrollIntoViewAlignment({
      alignment: Reflect.get(scrollIntoViewArgument, 'inline'),
      defaultAlignment: START_ALIGNMENTS.inline,
    }),
  };
};
