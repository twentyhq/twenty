import { isDefined } from 'twenty-shared/utils';

import { MATCHING_MEDIA_TYPES } from '@/polyfills/media-query/constants/MatchingMediaTypes';
import { NON_MATCHING_MEDIA_TYPES } from '@/polyfills/media-query/constants/NonMatchingMediaTypes';
import { type ParsedMediaQuery } from '@/polyfills/media-query/types/ParsedMediaQuery';
import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';
import { parseMediaQueryCondition } from '@/polyfills/media-query/utils/parseMediaQueryCondition';

export const parseMediaQuery = (
  mediaQueryString: string,
): ParsedMediaQuery | null => {
  const normalizedQuery = mediaQueryString.trim().toLowerCase();

  if (normalizedQuery === '') {
    return { isNegated: false, matchesMediaType: true, conditions: [] };
  }

  const queryParts = normalizedQuery.split(/\s+and\s+/);

  let isNegated = false;
  let matchesMediaType = true;
  const conditions: ParsedMediaQueryCondition[] = [];

  for (const [partIndex, queryPart] of queryParts.entries()) {
    let currentPart = queryPart.trim();

    if (partIndex === 0) {
      if (currentPart.startsWith('not ')) {
        isNegated = true;
        currentPart = currentPart.slice('not '.length).trim();
      } else if (currentPart.startsWith('only ')) {
        currentPart = currentPart.slice('only '.length).trim();
      }
    }

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
