import { isDefined } from 'twenty-shared/utils';

type CaretPreservingElement = HTMLInputElement | HTMLTextAreaElement;

export const syncValuePreservingCaret = ({
  element,
  nextValue,
}: {
  element: CaretPreservingElement;
  nextValue: string;
}): boolean => {
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
