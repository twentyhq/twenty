import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { iterateMatchingDescendants } from '@/polyfills/selectors/utils/iterateMatchingDescendants';

export const findFirstMatchingDescendant = ({
  nodes,
  isElementMatching,
}: {
  nodes: SelectorElementLike[];
  isElementMatching: (element: SelectorElementLike) => boolean;
}): SelectorElementLike | null =>
  iterateMatchingDescendants({ nodes, isElementMatching }).next().value ?? null;
