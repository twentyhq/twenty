import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';

export const resolvePreviousSiblingElement = (
  element: SelectorElementLike,
): SelectorElementLike | null =>
  isSelectorElementNode(element.previousElementSibling)
    ? element.previousElementSibling
    : null;
