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
  const isSelectionStartValid =
    isNumber(selectionStart) || isNull(selectionStart);
  const isSelectionEndValid = isNumber(selectionEnd) || isNull(selectionEnd);
  const isSelectionDirectionValid =
    isInputSelectionDirection(selectionDirection) || isNull(selectionDirection);

  if (
    !isSelectionStartValid ||
    !isSelectionEndValid ||
    !isSelectionDirectionValid
  ) {
    return undefined;
  }

  return { selectionStart, selectionEnd, selectionDirection };
};
