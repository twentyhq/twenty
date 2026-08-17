import { type ParsedMediaQueryModifier } from '@/polyfills/media-query/types/ParsedMediaQueryModifier';

const NOT_MODIFIER_PREFIX = 'not ';
const ONLY_MODIFIER_PREFIX = 'only ';

export const parseMediaQueryModifier = (
  firstQueryPart: string,
): ParsedMediaQueryModifier => {
  if (firstQueryPart.startsWith(NOT_MODIFIER_PREFIX)) {
    return {
      isNegated: true,
      requiresMediaType: false,
      remainingFirstPart: firstQueryPart
        .slice(NOT_MODIFIER_PREFIX.length)
        .trim(),
    };
  }

  if (firstQueryPart.startsWith(ONLY_MODIFIER_PREFIX)) {
    return {
      isNegated: false,
      requiresMediaType: true,
      remainingFirstPart: firstQueryPart
        .slice(ONLY_MODIFIER_PREFIX.length)
        .trim(),
    };
  }

  return {
    isNegated: false,
    requiresMediaType: false,
    remainingFirstPart: firstQueryPart,
  };
};
