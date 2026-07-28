import { camelToKebab } from 'twenty-shared/utils';

import { isCssCustomPropertyName } from '@/utils/isCssCustomPropertyName';

const CSS_PROPERTY_NAME_BY_CSSOM_ALIAS = new Map<string, string>([
  ['cssFloat', 'float'],
]);

export const resolveCssPropertyNameFromJsPropertyName = (
  jsPropertyName: string,
): string => {
  if (isCssCustomPropertyName(jsPropertyName)) {
    return jsPropertyName;
  }

  const aliasedCssPropertyName =
    CSS_PROPERTY_NAME_BY_CSSOM_ALIAS.get(jsPropertyName);

  if (aliasedCssPropertyName !== undefined) {
    return aliasedCssPropertyName;
  }

  return camelToKebab(jsPropertyName);
};
