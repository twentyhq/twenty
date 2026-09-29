import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type ParsedMediaQuery } from '@/polyfills/media-query/types/ParsedMediaQuery';
import { parseMediaQuery } from '@/polyfills/media-query/utils/parseMediaQuery';
import { splitCssAtTopLevel } from '@/polyfills/media-query/utils/splitCssAtTopLevel';
import { trimCssWhitespace } from '@/polyfills/media-query/utils/trimCssWhitespace';

const MEDIA_QUERY_LIST_SEPARATOR = ',';

const MATCH_ALL_MEDIA_QUERY = 'all';

export const parseMediaQueryList = (
  mediaQueryListString: string,
): ParsedMediaQuery[] => {
  const [firstMediaQueryString, ...otherMediaQueryStrings] = splitCssAtTopLevel(
    {
      cssText: mediaQueryListString,
      separator: MEDIA_QUERY_LIST_SEPARATOR,
    },
  );

  const isEmptyMediaQueryList =
    !isNonEmptyArray(otherMediaQueryStrings) &&
    !isNonEmptyString(trimCssWhitespace(firstMediaQueryString));

  const mediaQueryStrings = isEmptyMediaQueryList
    ? [MATCH_ALL_MEDIA_QUERY]
    : [firstMediaQueryString, ...otherMediaQueryStrings];

  return mediaQueryStrings
    .map((mediaQueryString) => parseMediaQuery(mediaQueryString))
    .filter(isDefined);
};
