import { iterateElementSubtree } from '@/polyfills/dom/utils/iterateElementSubtree';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';

export const collectMatchingDescendants = ({
  nodes,
  isElementMatching,
}: {
  nodes: SelectorElementLike[];
  isElementMatching: (element: SelectorElementLike) => boolean;
}): SelectorElementLike[] => {
  const matchingDescendants: SelectorElementLike[] = [];

  for (const node of nodes) {
    for (const descendant of iterateElementSubtree(node)) {
      if (isSelectorElementNode(descendant) && isElementMatching(descendant)) {
        matchingDescendants.push(descendant);
      }
    }
  }

  return matchingDescendants;
};
