import { iterateElementSubtree } from '@/polyfills/dom/utils/iterateElementSubtree';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';

export const findFirstMatchingDescendant = ({
  nodes,
  isElementMatching,
}: {
  nodes: SelectorElementLike[];
  isElementMatching: (element: SelectorElementLike) => boolean;
}): SelectorElementLike | null => {
  for (const node of nodes) {
    for (const descendant of iterateElementSubtree(node)) {
      if (isSelectorElementNode(descendant) && isElementMatching(descendant)) {
        return descendant;
      }
    }
  }

  return null;
};
