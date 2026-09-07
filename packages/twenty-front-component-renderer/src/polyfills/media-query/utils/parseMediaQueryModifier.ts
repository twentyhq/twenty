import { isDefined } from 'twenty-shared/utils';

import { CSS_WHITESPACE_CHARACTER_CLASS } from '@/polyfills/media-query/constants/CssWhitespaceCharacterClass';
import { type ParsedMediaQueryModifier } from '@/polyfills/media-query/types/ParsedMediaQueryModifier';

const NOT_MODIFIER_PATTERN = new RegExp(
  `^not${CSS_WHITESPACE_CHARACTER_CLASS}+`,
);
const ONLY_MODIFIER_PATTERN = new RegExp(
  `^only${CSS_WHITESPACE_CHARACTER_CLASS}+`,
);

export const parseMediaQueryModifier = (
  firstQueryPart: string,
): ParsedMediaQueryModifier => {
  const notModifierMatch = firstQueryPart.match(NOT_MODIFIER_PATTERN);

  if (isDefined(notModifierMatch)) {
    return {
      modifier: 'not',
      remainingFirstPart: firstQueryPart.slice(notModifierMatch[0].length),
    };
  }

  const onlyModifierMatch = firstQueryPart.match(ONLY_MODIFIER_PATTERN);

  if (isDefined(onlyModifierMatch)) {
    return {
      modifier: 'only',
      remainingFirstPart: firstQueryPart.slice(onlyModifierMatch[0].length),
    };
  }

  return { modifier: null, remainingFirstPart: firstQueryPart };
};
