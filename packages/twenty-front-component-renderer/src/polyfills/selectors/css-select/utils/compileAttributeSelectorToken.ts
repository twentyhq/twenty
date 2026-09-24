import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { CASE_INSENSITIVE_HTML_ATTRIBUTE_NAMES } from '@/polyfills/selectors/css-select/constants/CaseInsensitiveHtmlAttributeNames';
import { type AttributeSelectorAction } from '@/polyfills/selectors/css-select/types/AttributeSelectorAction';
import { type AttributeSelectorToken } from '@/polyfills/selectors/css-select/types/AttributeSelectorToken';
import { type CompiledSelectorMatcher } from '@/polyfills/selectors/types/CompiledSelectorMatcher';
import { hasElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/hasElementAttributeIgnoringCase';
import { readElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/readElementAttributeIgnoringCase';

type AttributeValueMatcher = (
  attributeValue: string,
  expectedValue: string,
) => boolean;

const ATTRIBUTE_VALUE_MATCHER_BY_ACTION: Record<
  Exclude<AttributeSelectorAction, 'exists'>,
  AttributeValueMatcher
> = {
  any: (attributeValue, expectedValue) =>
    isNonEmptyString(expectedValue) && attributeValue.includes(expectedValue),
  element: (attributeValue, expectedValue) =>
    isNonEmptyString(expectedValue) &&
    !/\s/.test(expectedValue) &&
    attributeValue.split(/\s+/).includes(expectedValue),
  end: (attributeValue, expectedValue) =>
    isNonEmptyString(expectedValue) && attributeValue.endsWith(expectedValue),
  equals: (attributeValue, expectedValue) => attributeValue === expectedValue,
  hyphen: (attributeValue, expectedValue) =>
    attributeValue === expectedValue ||
    attributeValue.startsWith(`${expectedValue}-`),
  start: (attributeValue, expectedValue) =>
    isNonEmptyString(expectedValue) && attributeValue.startsWith(expectedValue),
};

export const compileAttributeSelectorToken = ({
  next,
  token,
}: {
  next: CompiledSelectorMatcher;
  token: AttributeSelectorToken;
}): CompiledSelectorMatcher => {
  const attributeName = token.name.toLowerCase();

  if (token.action === 'exists') {
    return (element, context) =>
      hasElementAttributeIgnoringCase(element, attributeName) &&
      next(element, context);
  }

  const isCaseInsensitive =
    token.ignoreCase ??
    CASE_INSENSITIVE_HTML_ATTRIBUTE_NAMES.has(attributeName);
  const normalizeValue = (value: string): string =>
    isCaseInsensitive ? value.toLowerCase() : value;
  const expectedValue = normalizeValue(token.value);
  const doesAttributeValueMatch =
    ATTRIBUTE_VALUE_MATCHER_BY_ACTION[token.action];

  return (element, context) => {
    const attributeValue = readElementAttributeIgnoringCase(
      element,
      attributeName,
    );

    return (
      isDefined(attributeValue) &&
      doesAttributeValueMatch(normalizeValue(attributeValue), expectedValue) &&
      next(element, context)
    );
  };
};
