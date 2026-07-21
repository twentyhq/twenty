import { isDefined } from 'twenty-shared/utils';

type CaretPreservingElement = HTMLInputElement | HTMLTextAreaElement;

export const syncValuePreservingCaret = (
  element: CaretPreservingElement,
  nextValue: string,
): void => {
  if (element.value === nextValue) {
    return;
  }

  const isFocused = document.activeElement === element;
  const start = isFocused ? element.selectionStart : null;
  const end = isFocused ? element.selectionEnd : null;

  element.value = nextValue;

  if (isFocused && isDefined(start) && isDefined(end)) {
    try {
      element.setSelectionRange(start, end);
    } catch {}
  }
};
