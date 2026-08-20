import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { MATCH_ALL_PARSED_MEDIA_QUERY } from '@/polyfills/media-query/constants/MatchAllParsedMediaQuery';
import { type ParsedMediaQuery } from '@/polyfills/media-query/types/ParsedMediaQuery';
import { parseMediaQuery } from '@/polyfills/media-query/utils/parseMediaQuery';

export const parseMediaQueryList = (
  mediaQueryListString: string,
): ParsedMediaQuery[] => {
  if (!isNonEmptyString(mediaQueryListString.trim())) {
    return [MATCH_ALL_PARSED_MEDIA_QUERY];
  }

  return mediaQueryListString
    .split(',')
    .map((mediaQueryString) => parseMediaQuery(mediaQueryString))
    .filter(isDefined);
};
