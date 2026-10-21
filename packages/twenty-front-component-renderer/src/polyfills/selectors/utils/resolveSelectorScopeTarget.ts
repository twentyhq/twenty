import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { collectChildNodes } from '@/polyfills/selectors/utils/collectChildNodes';
import { isDocumentNode } from '@/polyfills/selectors/utils/isDocumentNode';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';

export const resolveSelectorScopeTarget = (
  scopeElement: SelectorElementLike,
): SelectorElementLike | undefined =>
  isDocumentNode(scopeElement)
    ? collectChildNodes(scopeElement).find(isSelectorElementNode)
    : scopeElement;
