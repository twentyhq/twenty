import { isNull, isObject, isUndefined } from '@sniptt/guards';

import { SCROLL_INTO_VIEW_ALIGNMENTS } from '@/constants/ScrollIntoViewAlignments';
import { type ScrollIntoViewAlignment } from '@/types/ScrollIntoViewAlignment';

type ScrollIntoViewAlignments = {
  block: ScrollIntoViewAlignment;
  inline: ScrollIntoViewAlignment;
};

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

  const matchingAlignment = SCROLL_INTO_VIEW_ALIGNMENTS.find(
    (scrollIntoViewAlignment) => scrollIntoViewAlignment === alignment,
  );

  if (isUndefined(matchingAlignment)) {
    throw new TypeError(
      `Failed to execute 'scrollIntoView' on 'Element': The provided value '${String(alignment)}' is not a valid enum value of type ScrollLogicalPosition.`,
    );
  }

  return matchingAlignment;
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
