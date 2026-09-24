import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';

export const resolveParentElement = (
  element: SelectorElementLike,
): SelectorElementLike | null =>
  isSelectorElementNode(element.parentNode) ? element.parentNode : null;
