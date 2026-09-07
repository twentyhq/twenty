import { isDefined } from 'twenty-shared/utils';

import { MEDIA_QUERY_KEYWORD_FEATURES } from '@/polyfills/media-query/constants/MediaQueryKeywordFeatures';
import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';
import { parseMediaQueryNumericFeatureName } from '@/polyfills/media-query/utils/parseMediaQueryNumericFeatureName';

type ParseMediaQueryPlainConditionInput = {
  featureName: string;
  featureValue: string;
};

export const parseMediaQueryPlainCondition = ({
  featureName,
  featureValue,
}: ParseMediaQueryPlainConditionInput): ParsedMediaQueryCondition | null => {
  const keywordFeature = MEDIA_QUERY_KEYWORD_FEATURES.get(featureName);

  if (isDefined(keywordFeature)) {
    return keywordFeature.values.has(featureValue)
      ? { kind: 'keyword', featureName, value: featureValue }
      : null;
  }

  const numericFeatureName = parseMediaQueryNumericFeatureName(featureName);

  if (!isDefined(numericFeatureName)) {
    return null;
  }

  const value = numericFeatureName.feature.parseValue(featureValue);

  if (!isDefined(value)) {
    return null;
  }

  return {
    kind: 'numeric',
    source: numericFeatureName.feature.source,
    operator: numericFeatureName.operator,
    value,
  };
};
