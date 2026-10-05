import { isNull, isNumber, isObject } from '@sniptt/guards';

import { type InputSelectionState } from '@/types/InputSelectionState';
import { isInputSelectionDirection } from '@/utils/isInputSelectionDirection';

export const readInputSelectionState = (
  target: unknown,
): InputSelectionState | undefined => {
  if (!isObject(target)) {
    return undefined;
  }
  const { selectionStart, selectionEnd, selectionDirection } = target as Record<
    string,
    unknown
  >;
  if (
    !(isNumber(selectionStart) || isNull(selectionStart)) ||
    !(isNumber(selectionEnd) || isNull(selectionEnd)) ||
    !(
      isInputSelectionDirection(selectionDirection) ||
      isNull(selectionDirection)
    )
  ) {
    return undefined;
  }
  return { selectionStart, selectionEnd, selectionDirection };
};
