import { type MediaQueryEnvironment } from '@/polyfills/media-query/types/MediaQueryEnvironment';
import { type ParsedMediaQuery } from '@/polyfills/media-query/types/ParsedMediaQuery';
import { evaluateParsedMediaQuery } from '@/polyfills/media-query/utils/evaluateParsedMediaQuery';

type EvaluateParsedMediaQueryListInput = {
  parsedMediaQueryList: ParsedMediaQuery[];
  environment: MediaQueryEnvironment;
};

export const evaluateParsedMediaQueryList = ({
  parsedMediaQueryList,
  environment,
}: EvaluateParsedMediaQueryListInput): boolean => {
  return parsedMediaQueryList.some((parsedMediaQuery) =>
    evaluateParsedMediaQuery({ parsedMediaQuery, environment }),
  );
};
