import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { iterateMatchingDescendants } from '@/polyfills/selectors/utils/iterateMatchingDescendants';

export const collectMatchingDescendants = ({
  nodes,
  isElementMatching,
}: {
  nodes: SelectorElementLike[];
  isElementMatching: (element: SelectorElementLike) => boolean;
}): SelectorElementLike[] => [
  ...iterateMatchingDescendants({ nodes, isElementMatching }),
];
