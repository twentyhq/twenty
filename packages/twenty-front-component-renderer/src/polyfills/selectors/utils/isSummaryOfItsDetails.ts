import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { collectChildNodes } from '@/polyfills/selectors/utils/collectChildNodes';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { resolveParentElement } from '@/polyfills/selectors/utils/resolveParentElement';
import { isDefined } from 'twenty-shared/utils';

export const isSummaryOfItsDetails = (
  element: SelectorElementLike,
): boolean => {
  const parentElement = resolveParentElement(element);

  if (
    !isDefined(parentElement) ||
    resolveHtmlTagNameOfElement(parentElement) !== 'details'
  ) {
    return false;
  }

  const firstSummaryElement = collectChildNodes(parentElement).find(
    (childNode) =>
      isSelectorElementNode(childNode) &&
      resolveHtmlTagNameOfElement(childNode) === 'summary',
  );

  return firstSummaryElement === element;
};
