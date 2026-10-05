import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { resolveParentElement } from '@/polyfills/selectors/utils/resolveParentElement';
import { isDefined } from 'twenty-shared/utils';

export const resolveOwnerSelectElement = (
  option: SelectorElementLike,
): SelectorElementLike | null => {
  const parentElement = resolveParentElement(option);

  if (
    isDefined(parentElement) &&
    resolveHtmlTagNameOfElement(parentElement) === 'select'
  ) {
    return parentElement;
  }

  if (
    !isDefined(parentElement) ||
    resolveHtmlTagNameOfElement(parentElement) !== 'optgroup'
  ) {
    return null;
  }

  const optgroupParentElement = resolveParentElement(parentElement);

  return isDefined(optgroupParentElement) &&
    resolveHtmlTagNameOfElement(optgroupParentElement) === 'select'
    ? optgroupParentElement
    : null;
};
