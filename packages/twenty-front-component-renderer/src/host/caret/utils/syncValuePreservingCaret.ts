import { isNumber, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type CaretPreservingElement } from '@/host/caret/types/CaretPreservingElement';

export const syncValuePreservingCaret = ({
  element,
  remoteValue,
}: {
  element: CaretPreservingElement | null;
  remoteValue: unknown;
}): boolean => {
  if (
    !isDefined(element) ||
    (!isString(remoteValue) && !isNumber(remoteValue))
  ) {
    return false;
  }

  const nextValue = String(remoteValue);

  if (element.value === nextValue) {
    return false;
  }

  const isFocused = document.activeElement === element;
  const start = isFocused ? element.selectionStart : null;
  const end = isFocused ? element.selectionEnd : null;
  const direction = isFocused ? element.selectionDirection : null;

  element.value = nextValue;

  if (isFocused && isDefined(start) && isDefined(end)) {
    try {
      element.setSelectionRange(start, end, direction ?? undefined);
    } catch {}
  }

  return true;
};
