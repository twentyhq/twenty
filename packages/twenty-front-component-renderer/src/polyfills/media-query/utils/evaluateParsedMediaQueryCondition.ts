import { type MediaQueryEnvironment } from '@/polyfills/media-query/types/MediaQueryEnvironment';
import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';

type EvaluateParsedMediaQueryConditionInput = {
  condition: ParsedMediaQueryCondition;
  environment: MediaQueryEnvironment;
};

export const evaluateParsedMediaQueryCondition = ({
  condition,
  environment,
}: EvaluateParsedMediaQueryConditionInput): boolean => {
  if (condition.kind === 'color-scheme') {
    return condition.value === environment.colorScheme;
  }

  const environmentValue = environment[condition.source];

  if (condition.comparison === 'min') {
    return environmentValue >= condition.value;
  }

  if (condition.comparison === 'max') {
    return environmentValue <= condition.value;
  }

  return environmentValue === condition.value;
};
