import { type CssSelectAdapter } from '@/polyfills/selectors/types/CssSelectAdapter';
import { collectChildNodes } from '@/polyfills/selectors/utils/collectChildNodes';
import { collectSiblingNodes } from '@/polyfills/selectors/utils/collectSiblingNodes';
import { hasElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/hasElementAttributeIgnoringCase';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';
import { readElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/readElementAttributeIgnoringCase';
import { removeNestedNodes } from '@/polyfills/selectors/utils/removeNestedNodes';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { resolveNodeText } from '@/polyfills/selectors/utils/resolveNodeText';
import { resolveParentNode } from '@/polyfills/selectors/utils/resolveParentNode';
import { resolvePreviousSiblingElement } from '@/polyfills/selectors/utils/resolvePreviousSiblingElement';

export const WORKER_DOM_CSS_SELECT_ADAPTER: CssSelectAdapter = {
  isTag: isSelectorElementNode,
  getName: resolveHtmlTagNameOfElement,
  getAttributeValue: (element, attributeName) =>
    readElementAttributeIgnoringCase(element, attributeName) ?? undefined,
  hasAttrib: hasElementAttributeIgnoringCase,
  getChildren: collectChildNodes,
  getParent: resolveParentNode,
  getSiblings: collectSiblingNodes,
  prevElementSibling: resolvePreviousSiblingElement,
  getText: resolveNodeText,
  removeSubsets: removeNestedNodes,
};
