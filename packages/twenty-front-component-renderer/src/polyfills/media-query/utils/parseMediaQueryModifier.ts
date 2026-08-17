import { type ParsedMediaQueryModifier } from '@/polyfills/media-query/types/ParsedMediaQueryModifier';

export const parseMediaQueryModifier = (
  firstQueryPart: string,
): ParsedMediaQueryModifier => {
  if (firstQueryPart.startsWith('not ')) {
    return {
      isNegated: true,
      requiresMediaType: false,
      remainingFirstPart: firstQueryPart.slice('not '.length).trim(),
    };
  }

  if (firstQueryPart.startsWith('only ')) {
    return {
      isNegated: false,
      requiresMediaType: true,
      remainingFirstPart: firstQueryPart.slice('only '.length).trim(),
    };
  }

  return {
    isNegated: false,
    requiresMediaType: false,
    remainingFirstPart: firstQueryPart,
  };
};
