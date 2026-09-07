import { type MediaQueryEnvironment } from '@/polyfills/media-query/types/MediaQueryEnvironment';
import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';
import { resolveMediaQueryOrientation } from '@/polyfills/media-query/utils/resolveMediaQueryOrientation';

type EvaluateParsedMediaQueryConditionInput = {
  condition: ParsedMediaQueryCondition;
  environment: MediaQueryEnvironment;
};

export const evaluateParsedMediaQueryCondition = ({
  condition,
  environment,
}: EvaluateParsedMediaQueryConditionInput): boolean => {
  if (condition.kind === 'always-matching') {
    return true;
  }

  if (condition.kind === 'non-zero') {
    return environment[condition.source] !== 0;
  }

  if (condition.kind === 'color-scheme') {
    return condition.value === environment.colorScheme;
  }

  if (condition.kind === 'orientation') {
    return condition.value === resolveMediaQueryOrientation(environment);
  }

  const environmentValue = environment[condition.source];

  if (condition.comparison === 'min') {
    return environmentValue >= condition.value;
  }

  if (condition.comparison === 'max') {
    return environmentValue <= condition.value;
  }

  if (condition.comparison === 'greater-than') {
    return environmentValue > condition.value;
  }

  if (condition.comparison === 'less-than') {
    return environmentValue < condition.value;
  }

  return environmentValue === condition.value;
};
