import { isDefined } from 'twenty-shared/utils';

import { MEDIA_QUERY_KEYWORD_FEATURES } from '@/polyfills/media-query/constants/MediaQueryKeywordFeatures';
import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';
import { createMediaQueryNumericCondition } from '@/polyfills/media-query/utils/createMediaQueryNumericCondition';
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

  return createMediaQueryNumericCondition({
    feature: numericFeatureName.feature,
    operator: numericFeatureName.operator,
    valueString: featureValue,
  });
};
