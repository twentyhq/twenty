import { type MediaQueryEnvironment } from '@/polyfills/media-query/types/MediaQueryEnvironment';
import { type ParsedMediaQuery } from '@/polyfills/media-query/types/ParsedMediaQuery';
import { evaluateParsedMediaQueryCondition } from '@/polyfills/media-query/utils/evaluateParsedMediaQueryCondition';

export const evaluateParsedMediaQuery = (
  parsedMediaQuery: ParsedMediaQuery,
  environment: MediaQueryEnvironment,
): boolean => {
  const matchesWithoutNegation =
    parsedMediaQuery.matchesMediaType &&
    parsedMediaQuery.conditions.every((condition) =>
      evaluateParsedMediaQueryCondition(condition, environment),
    );

  return parsedMediaQuery.isNegated
    ? !matchesWithoutNegation
    : matchesWithoutNegation;
};
