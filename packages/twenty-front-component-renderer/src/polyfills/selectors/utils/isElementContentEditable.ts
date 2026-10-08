import { isDefined } from 'twenty-shared/utils';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { resolveInheritedAttributeValue } from '@/polyfills/selectors/utils/resolveInheritedAttributeValue';

const CONTENT_EDITABLE_KEYWORDS = new Set([
  '',
  'true',
  'false',
  'plaintext-only',
]);

export const isElementContentEditable = (
  element: SelectorElementLike,
): boolean => {
  const contentEditableValue = resolveInheritedAttributeValue({
    element,
    attributeName: 'contenteditable',
    isValueAccepted: (value) => CONTENT_EDITABLE_KEYWORDS.has(value),
  });

  return isDefined(contentEditableValue) && contentEditableValue !== 'false';
};
