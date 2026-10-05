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
  hasRemoteDomFalseDefault,
}: {
  attributeName: string;
  propertyValue: boolean;
  hasRemoteDomFalseDefault: boolean;
}): string | null => {
  const isBooleanishAttribute = isBooleanishAttributeName(attributeName);

  if (propertyValue) {
    return isBooleanishAttribute ? 'true' : '';
  }

  const isFalseDistinguishableFromUnset = !hasRemoteDomFalseDefault;

  return isBooleanishAttribute && isFalseDistinguishableFromUnset
    ? 'false'
    : null;
};

export const serializeRemotePropertyAsAttributeValue = ({
  attributeName,
  propertyValue,
  hasRemoteDomFalseDefault,
}: {
  attributeName: string;
  propertyValue: unknown;
  hasRemoteDomFalseDefault: boolean;
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
      hasRemoteDomFalseDefault,
    });
  }

  if (attributeName === 'style' && isObject(propertyValue)) {
    const cssText = (propertyValue as StyleDeclarationLike).cssText;

    return isNonEmptyString(cssText) ? cssText : null;
  }

  return null;
};
