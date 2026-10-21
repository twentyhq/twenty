import { iterateElementSubtree } from '@/polyfills/dom/utils/iterateElementSubtree';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';

export function* iterateMatchingDescendants({
  nodes,
  isElementMatching,
}: {
  nodes: SelectorElementLike[];
  isElementMatching: (element: SelectorElementLike) => boolean;
}): Generator<SelectorElementLike> {
  for (const node of nodes) {
    for (const descendant of iterateElementSubtree(node)) {
      if (isSelectorElementNode(descendant) && isElementMatching(descendant)) {
        yield descendant;
      }
    }
  }
}
