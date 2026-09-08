import { isDefined } from 'twenty-shared/utils';

import { MEDIA_QUERY_KEYWORD_FEATURES } from '@/polyfills/media-query/constants/MediaQueryKeywordFeatures';
import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';
import { parseMediaQueryBareNumericFeature } from '@/polyfills/media-query/utils/parseMediaQueryBareNumericFeature';

export const parseMediaQueryBooleanCondition = (
  featureName: string,
): ParsedMediaQueryCondition[] | null => {
  if (MEDIA_QUERY_KEYWORD_FEATURES.has(featureName)) {
    return [];
  }

  const feature = parseMediaQueryBareNumericFeature(featureName);

  if (!isDefined(feature)) {
    return null;
  }

  return [{ kind: 'non-zero', source: feature.source }];
};
