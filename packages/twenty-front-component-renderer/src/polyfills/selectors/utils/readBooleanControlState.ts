import { isBoolean } from '@sniptt/guards';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { hasElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/hasElementAttributeIgnoringCase';

export const readBooleanControlState = ({
  element,
  propertyName,
}: {
  element: SelectorElementLike;
  propertyName: 'checked' | 'disabled' | 'selected';
}): boolean => {
  const propertyValue = element[propertyName];

  return isBoolean(propertyValue)
    ? propertyValue
    : hasElementAttributeIgnoringCase(element, propertyName);
};
