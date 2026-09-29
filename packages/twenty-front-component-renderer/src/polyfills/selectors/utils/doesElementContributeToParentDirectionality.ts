import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';
import { readElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/readElementAttributeIgnoringCase';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';

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

export const doesElementContributeToParentDirectionality = (
  element: SelectorElementLike,
): boolean =>
  isSelectorElementNode(element) &&
  !TAG_NAMES_EXCLUDED_FROM_PARENT_DIRECTIONALITY.has(
    resolveHtmlTagNameOfElement(element),
  ) &&
  !hasDeclaredDirectionality(element);
