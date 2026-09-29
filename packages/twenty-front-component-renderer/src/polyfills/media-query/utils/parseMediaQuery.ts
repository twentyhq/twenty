import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { MATCHING_MEDIA_TYPES } from '@/polyfills/media-query/constants/MatchingMediaTypes';
import { type ParsedMediaQuery } from '@/polyfills/media-query/types/ParsedMediaQuery';
import { isMediaQueryTypeIdentifier } from '@/polyfills/media-query/utils/isMediaQueryTypeIdentifier';
import { normalizeMediaQueryString } from '@/polyfills/media-query/utils/normalizeMediaQueryString';
import { parseMediaQueryConditionParts } from '@/polyfills/media-query/utils/parseMediaQueryConditionParts';
import { parseMediaQueryModifier } from '@/polyfills/media-query/utils/parseMediaQueryModifier';
import { splitCssAtTopLevel } from '@/polyfills/media-query/utils/splitCssAtTopLevel';

const MEDIA_QUERY_PART_SEPARATOR = ' and ';

const CONDITION_OPENING_PARENTHESIS = '(';

export const parseMediaQuery = (
  mediaQueryString: string,
): ParsedMediaQuery | null => {
  const normalizedQuery = normalizeMediaQueryString(mediaQueryString);

  if (!isNonEmptyString(normalizedQuery)) {
    return null;
  }

  const [firstQueryPart, ...followingQueryParts] = splitCssAtTopLevel({
    cssText: normalizedQuery,
    separator: MEDIA_QUERY_PART_SEPARATOR,
  });

  const { modifier, remainingFirstPart } =
    parseMediaQueryModifier(firstQueryPart);

  const isNegated = modifier === 'not';
  const startsWithCondition = remainingFirstPart.startsWith(
    CONDITION_OPENING_PARENTHESIS,
  );
  const isOnlyWithoutMediaType = modifier === 'only' && startsWithCondition;
  const isNegatedConditionFollowedByAnd =
    isNegated && startsWithCondition && isNonEmptyArray(followingQueryParts);
  const isInvalidMediaType =
    !startsWithCondition && !isMediaQueryTypeIdentifier(remainingFirstPart);

  if (
    isOnlyWithoutMediaType ||
    isNegatedConditionFollowedByAnd ||
    isInvalidMediaType
  ) {
    return null;
  }

  const parsedConditionParts = parseMediaQueryConditionParts(
    startsWithCondition
      ? [remainingFirstPart, ...followingQueryParts]
      : followingQueryParts,
  );

  if (!isDefined(parsedConditionParts)) {
    return null;
  }

  const canNeverMatch = parsedConditionParts.hasUnknownCondition && !isNegated;

  if (canNeverMatch) {
    return null;
  }

  return {
    isNegated,
    matchesMediaType:
      startsWithCondition || MATCHING_MEDIA_TYPES.has(remainingFirstPart),
    conditions: parsedConditionParts.knownConditions,
  };
};
