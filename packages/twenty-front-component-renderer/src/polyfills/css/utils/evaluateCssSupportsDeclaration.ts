import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { CSS_WIDE_KEYWORDS } from '@/polyfills/css/constants/CssWideKeywords';
import { SUPPORTED_CSS_PROPERTY_KEYWORDS } from '@/polyfills/css/constants/SupportedCssPropertyKeywords';
import { isCssCustomPropertyName } from '@/utils/css/isCssCustomPropertyName';
import { normalizeCssPropertyName } from '@/utils/css/normalizeCssPropertyName';
import { stripImportantPriorityFromCssValue } from '@/utils/css/stripImportantPriorityFromCssValue';

type EvaluateCssSupportsDeclarationInput = {
  property: string;
  value: string;
};

export const evaluateCssSupportsDeclaration = ({
  property,
  value,
}: EvaluateCssSupportsDeclarationInput): boolean => {
  // The property is not trimmed: native rejects a padded property name in the
  // two-argument form, and the condition form trims before it gets here.
  const normalizedProperty = normalizeCssPropertyName(property);
  const normalizedValue = value.trim().toLowerCase();

  if (!isNonEmptyString(normalizedValue)) {
    return false;
  }

  // A priority is only ever valid in the condition form, which strips it first
  if (stripImportantPriorityFromCssValue(normalizedValue) !== normalizedValue) {
    return false;
  }

  if (
    isCssCustomPropertyName(normalizedProperty) &&
    normalizedProperty.length > 2
  ) {
    return true;
  }

  const supportedKeywords =
    SUPPORTED_CSS_PROPERTY_KEYWORDS.get(normalizedProperty);

  if (!isDefined(supportedKeywords)) {
    return false;
  }

  return (
    CSS_WIDE_KEYWORDS.includes(normalizedValue) ||
    supportedKeywords.includes(normalizedValue)
  );
};
