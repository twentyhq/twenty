import { isAncestorOrSelfOfNode } from '@/polyfills/dom/utils/isAncestorOrSelfOfNode';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';

export const removeNestedNodes = (
  nodes: SelectorElementLike[],
): SelectorElementLike[] => {
  const uniqueNodes = [...new Set(nodes)];

  return uniqueNodes.filter(
    (node) =>
      !uniqueNodes.some(
        (otherNode) =>
          otherNode !== node && isAncestorOrSelfOfNode(otherNode, node),
      ),
  );
};
