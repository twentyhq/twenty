import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';

export const resolveNextSiblingElement = (
  element: SelectorElementLike,
): SelectorElementLike | null =>
  isSelectorElementNode(element.nextElementSibling)
    ? element.nextElementSibling
    : null;
