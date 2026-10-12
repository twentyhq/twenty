import { ASCII_UPPERCASE_LETTER_REGEX } from '@/polyfills/dom/constants/AsciiUppercaseLetterRegex';
import { DATA_ATTRIBUTE_PREFIX } from '@/polyfills/dom/constants/DataAttributePrefix';

export const isDatasetAttributeName = (attributeName: string): boolean => {
  if (!attributeName.startsWith(DATA_ATTRIBUTE_PREFIX)) {
    return false;
  }

  const attributeNameWithoutDataPrefix = attributeName.slice(
    DATA_ATTRIBUTE_PREFIX.length,
  );

  return !ASCII_UPPERCASE_LETTER_REGEX.test(attributeNameWithoutDataPrefix);
};
