import { isDefined } from 'twenty-shared/utils';

import { ALWAYS_MATCHING_BOOLEAN_MEDIA_FEATURE_NAMES } from '@/polyfills/media-query/constants/AlwaysMatchingBooleanMediaFeatureNames';
import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';
import { parseMediaQueryNumericFeatureName } from '@/polyfills/media-query/utils/parseMediaQueryNumericFeatureName';

export const parseMediaQueryBooleanCondition = (
  featureName: string,
): ParsedMediaQueryCondition | null => {
  if (ALWAYS_MATCHING_BOOLEAN_MEDIA_FEATURE_NAMES.has(featureName)) {
    return { kind: 'always-matching' };
  }

  const numericFeatureName = parseMediaQueryNumericFeatureName(featureName);

  if (
    !isDefined(numericFeatureName) ||
    numericFeatureName.comparison !== 'exact'
  ) {
    return null;
  }

  return { kind: 'non-zero', source: numericFeatureName.feature.source };
};
