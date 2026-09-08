import { isDefined } from 'twenty-shared/utils';

import { CSS_WHITESPACE_CHARACTER_CLASS } from '@/polyfills/media-query/constants/CssWhitespaceCharacterClass';
import { type ParsedMediaQueryModifier } from '@/polyfills/media-query/types/ParsedMediaQueryModifier';

const MODIFIER_PATTERN = new RegExp(
  `^(not|only)${CSS_WHITESPACE_CHARACTER_CLASS}+`,
);

export const parseMediaQueryModifier = (
  firstQueryPart: string,
): ParsedMediaQueryModifier => {
  const modifierMatch = firstQueryPart.match(MODIFIER_PATTERN);

  if (!isDefined(modifierMatch)) {
    return { modifier: null, remainingFirstPart: firstQueryPart };
  }

  return {
    modifier: modifierMatch[1] === 'not' ? 'not' : 'only',
    remainingFirstPart: firstQueryPart.slice(modifierMatch[0].length),
  };
};
