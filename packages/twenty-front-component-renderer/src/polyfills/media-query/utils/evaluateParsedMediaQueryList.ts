import { isDefined } from 'twenty-shared/utils';

import { type MediaQueryEnvironment } from '@/polyfills/media-query/types/MediaQueryEnvironment';
import { type ParsedMediaQuery } from '@/polyfills/media-query/types/ParsedMediaQuery';
import { evaluateParsedMediaQuery } from '@/polyfills/media-query/utils/evaluateParsedMediaQuery';

export const evaluateParsedMediaQueryList = (
  parsedMediaQueryList: (ParsedMediaQuery | null)[],
  environment: MediaQueryEnvironment,
): boolean => {
  return parsedMediaQueryList.some(
    (parsedMediaQuery) =>
      isDefined(parsedMediaQuery) &&
      evaluateParsedMediaQuery(parsedMediaQuery, environment),
  );
};
