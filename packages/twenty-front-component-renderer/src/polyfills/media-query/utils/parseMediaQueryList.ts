import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type ParsedMediaQuery } from '@/polyfills/media-query/types/ParsedMediaQuery';
import { parseMediaQuery } from '@/polyfills/media-query/utils/parseMediaQuery';

const MATCH_ALL_MEDIA_QUERY = 'all';

export const parseMediaQueryList = (
  mediaQueryListString: string,
): ParsedMediaQuery[] => {
  const isEmptyMediaQueryList = !isNonEmptyString(mediaQueryListString.trim());
  const mediaQueryListToParse = isEmptyMediaQueryList
    ? MATCH_ALL_MEDIA_QUERY
    : mediaQueryListString;

  return mediaQueryListToParse
    .split(',')
    .map((mediaQueryString) => parseMediaQuery(mediaQueryString))
    .filter(isDefined);
};
