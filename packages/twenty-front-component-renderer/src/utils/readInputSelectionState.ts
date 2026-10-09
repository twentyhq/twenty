import { isNumber } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { type InputSelectionRange } from '@/types/InputSelectionRange';
import { isInputSelectionDirection } from '@/utils/isInputSelectionDirection';

export const readInputSelectionState = (
  target: unknown,
): InputSelectionRange | undefined => {
  if (!isPlainObject(target)) {
    return undefined;
  }

  const { selectionStart, selectionEnd, selectionDirection } = target;

  if (
    !isNumber(selectionStart) ||
    !isNumber(selectionEnd) ||
    !isInputSelectionDirection(selectionDirection)
  ) {
    return undefined;
  }

  return { selectionStart, selectionEnd, selectionDirection };
};
