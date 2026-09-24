import {
  isBoolean,
  isNonEmptyString,
  isNumber,
  isObject,
  isString,
} from '@sniptt/guards';

import { isBooleanishAttributeName } from '@/remote/elements/utils/isBooleanishAttributeName';

type StyleDeclarationLike = {
  cssText?: unknown;
};

const serializeBooleanPropertyValue = ({
  attributeName,
  propertyValue,
  isBooleanTypedProperty,
}: {
  attributeName: string;
  propertyValue: boolean;
  isBooleanTypedProperty: boolean;
}): string | null => {
  const isBooleanishAttribute = isBooleanishAttributeName(attributeName);

  if (propertyValue) {
    return isBooleanishAttribute ? 'true' : '';
  }

  // remote-dom seeds every Boolean property with false, so false on a
  // Boolean-typed property cannot be told apart from a property never set.
  return isBooleanishAttribute && !isBooleanTypedProperty ? 'false' : null;
};

export const serializeRemotePropertyAsAttributeValue = ({
  attributeName,
  propertyValue,
  isBooleanTypedProperty,
}: {
  attributeName: string;
  propertyValue: unknown;
  isBooleanTypedProperty: boolean;
}): string | null => {
  if (isString(propertyValue)) {
    return propertyValue;
  }

  if (isNumber(propertyValue)) {
    return String(propertyValue);
  }

  if (isBoolean(propertyValue)) {
    return serializeBooleanPropertyValue({
      attributeName,
      propertyValue,
      isBooleanTypedProperty,
    });
  }

  if (attributeName === 'style' && isObject(propertyValue)) {
    const cssText = (propertyValue as StyleDeclarationLike).cssText;

    return isNonEmptyString(cssText) ? cssText : null;
  }

  return null;
};
