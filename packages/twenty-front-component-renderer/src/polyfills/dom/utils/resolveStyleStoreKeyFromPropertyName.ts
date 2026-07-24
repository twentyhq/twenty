import { camelToKebab } from 'twenty-shared/utils';

import { isCssCustomPropertyName } from '@/utils/isCssCustomPropertyName';

const CSS_PROPERTY_NAME_BY_CSSOM_ALIAS: Record<string, string> = {
  cssFloat: 'float',
};

export const resolveStyleStoreKeyFromPropertyName = (
  propertyName: string,
): string => {
  if (isCssCustomPropertyName(propertyName)) {
    return propertyName;
  }

  const aliasedCssPropertyName = CSS_PROPERTY_NAME_BY_CSSOM_ALIAS[propertyName];

  if (aliasedCssPropertyName !== undefined) {
    return aliasedCssPropertyName;
  }

  return camelToKebab(propertyName);
};
