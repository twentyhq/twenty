import { collectAncestorChainFromRootToNode } from '@/polyfills/dom/utils/collectAncestorChainFromRootToNode';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';

export const resolveNodeTreeRoot = (
  node: SelectorElementLike,
): SelectorElementLike =>
  (collectAncestorChainFromRootToNode(node)[0] ?? node) as SelectorElementLike;
