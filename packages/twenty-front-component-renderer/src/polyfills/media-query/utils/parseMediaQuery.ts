import { isDefined } from 'twenty-shared/utils';

import { MATCHING_MEDIA_TYPES } from '@/polyfills/media-query/constants/MatchingMediaTypes';
import { NON_MATCHING_MEDIA_TYPES } from '@/polyfills/media-query/constants/NonMatchingMediaTypes';
import { type ParsedMediaQuery } from '@/polyfills/media-query/types/ParsedMediaQuery';
import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';
import { isMediaQueryConditionPart } from '@/polyfills/media-query/utils/isMediaQueryConditionPart';
import { parseMediaQueryCondition } from '@/polyfills/media-query/utils/parseMediaQueryCondition';
import { parseMediaQueryModifier } from '@/polyfills/media-query/utils/parseMediaQueryModifier';

const MEDIA_QUERY_PART_SEPARATOR_PATTERN = /\s+and\s+/;

export const parseMediaQuery = (
  mediaQueryString: string,
): ParsedMediaQuery | null => {
  const normalizedQuery = mediaQueryString.trim().toLowerCase();

  if (normalizedQuery === '') {
    return { isNegated: false, matchesMediaType: true, conditions: [] };
  }

  const [firstQueryPart, ...followingQueryParts] = normalizedQuery.split(
    MEDIA_QUERY_PART_SEPARATOR_PATTERN,
  );

  const { isNegated, requiresMediaType, remainingFirstPart } =
    parseMediaQueryModifier(firstQueryPart.trim());

  if (requiresMediaType && isMediaQueryConditionPart(remainingFirstPart)) {
    return null;
  }

  const queryParts = [remainingFirstPart, ...followingQueryParts];

  let matchesMediaType = true;
  const conditions: ParsedMediaQueryCondition[] = [];

  for (const [partIndex, queryPart] of queryParts.entries()) {
    const currentPart = queryPart.trim();
    const isFirstQueryPart = partIndex === 0;

    if (isMediaQueryConditionPart(currentPart)) {
      const parsedCondition = parseMediaQueryCondition(currentPart);

      if (!isDefined(parsedCondition)) {
        return null;
      }

      conditions.push(parsedCondition);
      continue;
    }

    if (!isFirstQueryPart) {
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
