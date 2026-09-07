import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type ParsedMediaQuery } from '@/polyfills/media-query/types/ParsedMediaQuery';
import { parseMediaQuery } from '@/polyfills/media-query/utils/parseMediaQuery';
import { trimCssWhitespace } from '@/polyfills/media-query/utils/trimCssWhitespace';

const MATCH_ALL_MEDIA_QUERY = 'all';

export const parseMediaQueryList = (
  mediaQueryListString: string,
): ParsedMediaQuery[] => {
  const trimmedMediaQueryListString = trimCssWhitespace(mediaQueryListString);
  const mediaQueryListToParse = isNonEmptyString(trimmedMediaQueryListString)
    ? trimmedMediaQueryListString
    : MATCH_ALL_MEDIA_QUERY;

  return mediaQueryListToParse
    .split(',')
    .map((mediaQueryString) => parseMediaQuery(mediaQueryString))
    .filter(isDefined);
};
