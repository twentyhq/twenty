import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { CSS_WIDE_KEYWORDS } from '@/polyfills/window-aliases/constants/CssWideKeywords';
import { SUPPORTED_CSS_PROPERTY_KEYWORDS } from '@/polyfills/window-aliases/constants/SupportedCssPropertyKeywords';

type EvaluateCssSupportsDeclarationInput = {
  property: string;
  value: string;
};

export const evaluateCssSupportsDeclaration = ({
  property,
  value,
}: EvaluateCssSupportsDeclarationInput): boolean => {
  const normalizedProperty = property.trim().toLowerCase();
  const normalizedValue = value.trim().toLowerCase();

  const supportedKeywords = SUPPORTED_CSS_PROPERTY_KEYWORDS[normalizedProperty];

  if (!isDefined(supportedKeywords) || !isNonEmptyString(normalizedValue)) {
    return false;
  }

  return (
    CSS_WIDE_KEYWORDS.includes(normalizedValue) ||
    supportedKeywords.includes(normalizedValue)
  );
};
