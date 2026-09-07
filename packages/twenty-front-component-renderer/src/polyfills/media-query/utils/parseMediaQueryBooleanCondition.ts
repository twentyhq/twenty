import { isDefined } from 'twenty-shared/utils';

import { MEDIA_QUERY_KEYWORD_FEATURES } from '@/polyfills/media-query/constants/MediaQueryKeywordFeatures';
import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';
import { parseMediaQueryNumericFeatureName } from '@/polyfills/media-query/utils/parseMediaQueryNumericFeatureName';

export const parseMediaQueryBooleanCondition = (
  featureName: string,
): ParsedMediaQueryCondition | null => {
  if (MEDIA_QUERY_KEYWORD_FEATURES.has(featureName)) {
    return { kind: 'always-matching' };
  }

  const numericFeatureName = parseMediaQueryNumericFeatureName(featureName);

  if (!isDefined(numericFeatureName) || numericFeatureName.operator !== '=') {
    return null;
  }

  return { kind: 'non-zero', source: numericFeatureName.feature.source };
};
