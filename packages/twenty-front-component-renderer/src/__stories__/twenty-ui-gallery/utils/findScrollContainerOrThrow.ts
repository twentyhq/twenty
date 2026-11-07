import { isDefined } from 'twenty-shared/utils';

const SCROLLABLE_OVERFLOW_PATTERN = /auto|scroll/;

export const findScrollContainerOrThrow = (element: Element): HTMLElement => {
  for (
    let ancestor = element.parentElement;
    isDefined(ancestor);
    ancestor = ancestor.parentElement
  ) {
    const { overflowY } = getComputedStyle(ancestor);

    if (
      SCROLLABLE_OVERFLOW_PATTERN.test(overflowY) &&
      ancestor.scrollHeight > ancestor.clientHeight
    ) {
      return ancestor;
    }
  }

  throw new Error('The element has no vertical scroll container');
};
