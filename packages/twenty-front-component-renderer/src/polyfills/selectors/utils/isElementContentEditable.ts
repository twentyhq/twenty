import { isDefined } from 'twenty-shared/utils';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { resolveInheritedAttributeValue } from '@/polyfills/selectors/utils/resolveInheritedAttributeValue';

export const isElementContentEditable = (
  element: SelectorElementLike,
): boolean => {
  const contentEditableValue = resolveInheritedAttributeValue({
    element,
    attributeName: 'contenteditable',
    isValueAccepted: (value) => value !== 'inherit',
  });

  return isDefined(contentEditableValue) && contentEditableValue !== 'false';
};
