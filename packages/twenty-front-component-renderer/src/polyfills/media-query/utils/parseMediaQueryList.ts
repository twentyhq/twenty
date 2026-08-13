import { type ParsedMediaQuery } from '@/polyfills/media-query/types/ParsedMediaQuery';
import { parseMediaQuery } from '@/polyfills/media-query/utils/parseMediaQuery';

export const parseMediaQueryList = (
  mediaQueryListString: string,
): (ParsedMediaQuery | null)[] => {
  return mediaQueryListString
    .split(',')
    .map((mediaQueryString) => parseMediaQuery(mediaQueryString));
};
