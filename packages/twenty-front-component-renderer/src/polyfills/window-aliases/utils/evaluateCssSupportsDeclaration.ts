import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { CSS_WIDE_KEYWORDS } from '@/polyfills/window-aliases/constants/CssWideKeywords';
import { SUPPORTED_CSS_PROPERTY_KEYWORDS } from '@/polyfills/window-aliases/constants/SupportedCssPropertyKeywords';
import { isCssCustomPropertyName } from '@/utils/css/isCssCustomPropertyName';
import { normalizeCssPropertyName } from '@/utils/css/normalizeCssPropertyName';

type EvaluateCssSupportsDeclarationInput = {
  property: string;
  value: string;
};

export const evaluateCssSupportsDeclaration = ({
  property,
  value,
}: EvaluateCssSupportsDeclarationInput): boolean => {
  const normalizedProperty = normalizeCssPropertyName(property.trim());
  const normalizedValue = value.trim().toLowerCase();

  if (!isNonEmptyString(normalizedValue)) {
    return false;
  }

  if (isCssCustomPropertyName(normalizedProperty)) {
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
