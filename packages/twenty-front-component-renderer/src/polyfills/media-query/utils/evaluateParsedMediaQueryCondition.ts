import { MEDIA_QUERY_KEYWORD_FEATURES } from '@/polyfills/media-query/constants/MediaQueryKeywordFeatures';
import { type MediaQueryComparisonOperator } from '@/polyfills/media-query/types/MediaQueryComparisonOperator';
import { type MediaQueryEnvironment } from '@/polyfills/media-query/types/MediaQueryEnvironment';
import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';

const COMPARE_BY_OPERATOR: Record<
  MediaQueryComparisonOperator,
  (environmentValue: number, conditionValue: number) => boolean
> = {
  '<': (environmentValue, conditionValue) => environmentValue < conditionValue,
  '<=': (environmentValue, conditionValue) =>
    environmentValue <= conditionValue,
  '>': (environmentValue, conditionValue) => environmentValue > conditionValue,
  '>=': (environmentValue, conditionValue) =>
    environmentValue >= conditionValue,
  '=': (environmentValue, conditionValue) =>
    environmentValue === conditionValue,
};

type EvaluateParsedMediaQueryConditionInput = {
  condition: ParsedMediaQueryCondition;
  environment: MediaQueryEnvironment;
};

export const evaluateParsedMediaQueryCondition = ({
  condition,
  environment,
}: EvaluateParsedMediaQueryConditionInput): boolean => {
  if (condition.kind === 'non-zero') {
    return environment[condition.source] !== 0;
  }

  if (condition.kind === 'keyword') {
    return (
      MEDIA_QUERY_KEYWORD_FEATURES.get(condition.featureName)?.readValue(
        environment,
      ) === condition.value
    );
  }

  return COMPARE_BY_OPERATOR[condition.operator](
    environment[condition.source],
    condition.value,
  );
};
