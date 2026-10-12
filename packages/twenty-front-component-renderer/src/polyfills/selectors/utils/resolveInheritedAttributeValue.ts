import { isDefined } from 'twenty-shared/utils';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { readElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/readElementAttributeIgnoringCase';
import { resolveParentElement } from '@/polyfills/selectors/utils/resolveParentElement';

export const resolveInheritedAttributeValue = ({
  element,
  attributeName,
  isValueAccepted = () => true,
}: {
  element: SelectorElementLike;
  attributeName: string;
  isValueAccepted?: (value: string) => boolean;
}): string | null => {
  let currentElement: SelectorElementLike | null = element;

  while (isDefined(currentElement)) {
    const value = readElementAttributeIgnoringCase(
      currentElement,
      attributeName,
    )?.toLowerCase();

    if (isDefined(value) && isValueAccepted(value)) {
      return value;
    }

    currentElement = resolveParentElement(currentElement);
  }

  return null;
};
