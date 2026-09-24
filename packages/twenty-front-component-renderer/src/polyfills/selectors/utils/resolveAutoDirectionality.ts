import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { NODE_TYPE_BY_NAME } from '@/polyfills/dom/constants/NodeTypeByName';
import { type Directionality } from '@/polyfills/selectors/types/Directionality';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { collectChildNodes } from '@/polyfills/selectors/utils/collectChildNodes';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';
import { readElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/readElementAttributeIgnoringCase';
import { readElementValue } from '@/polyfills/selectors/utils/readElementValue';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { resolveTextDirectionality } from '@/polyfills/selectors/utils/resolveTextDirectionality';

const TEXT_ENTRY_TAG_NAMES = new Set(['input', 'textarea']);

const TAG_NAMES_EXCLUDED_FROM_PARENT_DIRECTIONALITY = new Set([
  'bdi',
  'script',
  'style',
  'textarea',
]);

const DIRECTIONALITY_ATTRIBUTE_VALUES = new Set(['ltr', 'rtl', 'auto']);

const hasDeclaredDirectionality = (element: SelectorElementLike): boolean =>
  DIRECTIONALITY_ATTRIBUTE_VALUES.has(
    readElementAttributeIgnoringCase(element, 'dir')?.toLowerCase() ?? '',
  );

const resolveChildNodeDirectionality = (
  childNode: SelectorElementLike,
): Directionality | null => {
  if (childNode.nodeType === NODE_TYPE_BY_NAME.TEXT) {
    return resolveTextDirectionality(
      isString(childNode.textContent) ? childNode.textContent : '',
    );
  }

  const isElementContributingText =
    isSelectorElementNode(childNode) &&
    !TAG_NAMES_EXCLUDED_FROM_PARENT_DIRECTIONALITY.has(
      resolveHtmlTagNameOfElement(childNode),
    ) &&
    !hasDeclaredDirectionality(childNode);

  return isElementContributingText
    ? resolveDescendantTextDirectionality(childNode)
    : null;
};

const resolveDescendantTextDirectionality = (
  element: SelectorElementLike,
): Directionality | null => {
  for (const childNode of collectChildNodes(element)) {
    const directionality = resolveChildNodeDirectionality(childNode);

    if (isDefined(directionality)) {
      return directionality;
    }
  }

  return null;
};

export const resolveAutoDirectionality = (
  element: SelectorElementLike,
): Directionality => {
  const textDirectionality = TEXT_ENTRY_TAG_NAMES.has(
    resolveHtmlTagNameOfElement(element),
  )
    ? resolveTextDirectionality(readElementValue(element) ?? '')
    : resolveDescendantTextDirectionality(element);

  return textDirectionality ?? 'ltr';
};
