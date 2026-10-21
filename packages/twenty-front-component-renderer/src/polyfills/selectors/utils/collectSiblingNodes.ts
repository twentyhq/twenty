import { isDefined } from 'twenty-shared/utils';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { collectChildNodes } from '@/polyfills/selectors/utils/collectChildNodes';
import { resolveParentNode } from '@/polyfills/selectors/utils/resolveParentNode';

export const collectSiblingNodes = (
  node: SelectorElementLike,
): SelectorElementLike[] => {
  const parentNode = resolveParentNode(node);

  return isDefined(parentNode) ? collectChildNodes(parentNode) : [node];
};
