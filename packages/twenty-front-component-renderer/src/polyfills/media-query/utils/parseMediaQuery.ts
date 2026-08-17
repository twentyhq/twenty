import { isDefined } from 'twenty-shared/utils';

import { MATCHING_MEDIA_TYPES } from '@/polyfills/media-query/constants/MatchingMediaTypes';
import { NON_MATCHING_MEDIA_TYPES } from '@/polyfills/media-query/constants/NonMatchingMediaTypes';
import { type ParsedMediaQuery } from '@/polyfills/media-query/types/ParsedMediaQuery';
import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';
import { parseMediaQueryCondition } from '@/polyfills/media-query/utils/parseMediaQueryCondition';
import { parseMediaQueryModifier } from '@/polyfills/media-query/utils/parseMediaQueryModifier';

export const parseMediaQuery = (
  mediaQueryString: string,
): ParsedMediaQuery | null => {
  const normalizedQuery = mediaQueryString.trim().toLowerCase();

  if (normalizedQuery === '') {
    return { isNegated: false, matchesMediaType: true, conditions: [] };
  }

  const [firstQueryPart, ...followingQueryParts] =
    normalizedQuery.split(/\s+and\s+/);

  const { isNegated, requiresMediaType, remainingFirstPart } =
    parseMediaQueryModifier(firstQueryPart.trim());

  if (requiresMediaType && remainingFirstPart.startsWith('(')) {
    return null;
  }

  const queryParts = [remainingFirstPart, ...followingQueryParts];

  let matchesMediaType = true;
  const conditions: ParsedMediaQueryCondition[] = [];

  for (const [partIndex, queryPart] of queryParts.entries()) {
    const currentPart = queryPart.trim();

    if (currentPart.startsWith('(')) {
      const parsedCondition = parseMediaQueryCondition(currentPart);

      if (!isDefined(parsedCondition)) {
        return null;
      }

      conditions.push(parsedCondition);
      continue;
    }

    if (partIndex > 0) {
      return null;
    }

    if (MATCHING_MEDIA_TYPES.has(currentPart)) {
      continue;
    }

    if (NON_MATCHING_MEDIA_TYPES.has(currentPart)) {
      matchesMediaType = false;
      continue;
    }

    return null;
  }

  return { isNegated, matchesMediaType, conditions };
};
