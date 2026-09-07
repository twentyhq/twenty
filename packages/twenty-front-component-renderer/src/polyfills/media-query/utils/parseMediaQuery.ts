import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { CSS_WHITESPACE_CHARACTER_CLASS } from '@/polyfills/media-query/constants/CssWhitespaceCharacterClass';
import { MATCHING_MEDIA_TYPES } from '@/polyfills/media-query/constants/MatchingMediaTypes';
import { type ParsedMediaQuery } from '@/polyfills/media-query/types/ParsedMediaQuery';
import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';
import { isMediaQueryConditionPart } from '@/polyfills/media-query/utils/isMediaQueryConditionPart';
import { isMediaQueryTypeIdentifier } from '@/polyfills/media-query/utils/isMediaQueryTypeIdentifier';
import { parseMediaQueryCondition } from '@/polyfills/media-query/utils/parseMediaQueryCondition';
import { parseMediaQueryModifier } from '@/polyfills/media-query/utils/parseMediaQueryModifier';

const MEDIA_QUERY_PART_SEPARATOR_PATTERN = new RegExp(
  `${CSS_WHITESPACE_CHARACTER_CLASS}+and${CSS_WHITESPACE_CHARACTER_CLASS}+`,
);

const CLOSING_PARENTHESIS_AND_PATTERN = new RegExp(
  `\\)${CSS_WHITESPACE_CHARACTER_CLASS}*and${CSS_WHITESPACE_CHARACTER_CLASS}+`,
  'g',
);

export const parseMediaQuery = (
  mediaQueryString: string,
): ParsedMediaQuery | null => {
  const normalizedQuery = mediaQueryString
    .trim()
    .toLowerCase()
    .replace(CLOSING_PARENTHESIS_AND_PATTERN, ') and ');

  if (!isNonEmptyString(normalizedQuery)) {
    return null;
  }

  const [firstQueryPart, ...followingQueryParts] = normalizedQuery.split(
    MEDIA_QUERY_PART_SEPARATOR_PATTERN,
  );

  const { modifier, remainingFirstPart } = parseMediaQueryModifier(
    firstQueryPart.trim(),
  );

  if (modifier === 'only' && isMediaQueryConditionPart(remainingFirstPart)) {
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

    if (isMediaQueryTypeIdentifier(currentPart)) {
      matchesMediaType = false;
      continue;
    }

    return null;
  }

  return { isNegated: modifier === 'not', matchesMediaType, conditions };
};
