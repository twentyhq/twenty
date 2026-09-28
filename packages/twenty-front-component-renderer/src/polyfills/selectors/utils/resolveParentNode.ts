import { isObject } from '@sniptt/guards';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';

export const resolveParentNode = (
  node: SelectorElementLike,
): SelectorElementLike | null =>
  isObject(node.parentNode) ? (node.parentNode as SelectorElementLike) : null;
