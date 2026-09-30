import { isDefined } from 'twenty-shared/utils';

import { ASCII_WHITESPACE_REGEX } from '@/polyfills/dom/constants/AsciiWhitespaceRegex';
import { type ParsedMediaQueryModifier } from '@/polyfills/media-query/types/ParsedMediaQueryModifier';

const MODIFIER_PATTERN = new RegExp(
  `^(not|only)${ASCII_WHITESPACE_REGEX.source}`,
);

export const parseMediaQueryModifier = (
  firstQueryPart: string,
): ParsedMediaQueryModifier => {
  const modifierMatch = firstQueryPart.match(MODIFIER_PATTERN);

  if (!isDefined(modifierMatch)) {
    return { modifier: null, remainingFirstPart: firstQueryPart };
  }

  const [modifierWithTrailingWhitespace, modifierKeyword] = modifierMatch;

  return {
    modifier: modifierKeyword === 'not' ? 'not' : 'only',
    remainingFirstPart: firstQueryPart.slice(
      modifierWithTrailingWhitespace.length,
    ),
  };
};
