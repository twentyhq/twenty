import { isDefined } from 'twenty-shared/utils';

const SCROLLABLE_OVERFLOW_VALUES = ['auto', 'scroll', 'overlay'];

export const getScrollContainer = (
  element: HTMLElement,
): HTMLElement | null => {
  let currentElement = element.parentElement;

  while (isDefined(currentElement)) {
    const { overflowY } = getComputedStyle(currentElement);

    if (
      SCROLLABLE_OVERFLOW_VALUES.includes(overflowY) &&
      currentElement.scrollHeight > currentElement.clientHeight
    ) {
      return currentElement;
    }

    currentElement = currentElement.parentElement;
  }

  return null;
};
