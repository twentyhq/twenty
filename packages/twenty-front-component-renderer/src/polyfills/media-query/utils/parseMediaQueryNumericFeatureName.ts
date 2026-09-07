import { isDefined } from 'twenty-shared/utils';

import { MEDIA_QUERY_NUMERIC_FEATURES } from '@/polyfills/media-query/constants/MediaQueryNumericFeatures';
import { type MediaQueryComparisonOperator } from '@/polyfills/media-query/types/MediaQueryComparisonOperator';
import { type ParsedMediaQueryNumericFeatureName } from '@/polyfills/media-query/types/ParsedMediaQueryNumericFeatureName';

const WEBKIT_FEATURE_PREFIX = '-webkit-';

const WEBKIT_ALLOWED_BASE_FEATURE_NAME = 'device-pixel-ratio';

const MINIMUM_FEATURE_PREFIX = 'min-';

const MAXIMUM_FEATURE_PREFIX = 'max-';

const parseComparisonPrefix = (
  featureName: string,
): { operator: MediaQueryComparisonOperator; baseFeatureName: string } => {
  if (featureName.startsWith(MINIMUM_FEATURE_PREFIX)) {
    return {
      operator: '>=',
      baseFeatureName: featureName.slice(MINIMUM_FEATURE_PREFIX.length),
    };
  }

  if (featureName.startsWith(MAXIMUM_FEATURE_PREFIX)) {
    return {
      operator: '<=',
      baseFeatureName: featureName.slice(MAXIMUM_FEATURE_PREFIX.length),
    };
  }

  return { operator: '=', baseFeatureName: featureName };
};

export const parseMediaQueryNumericFeatureName = (
  featureName: string,
): ParsedMediaQueryNumericFeatureName | null => {
  const isWebkitPrefixed = featureName.startsWith(WEBKIT_FEATURE_PREFIX);
  const unprefixedFeatureName = isWebkitPrefixed
    ? featureName.slice(WEBKIT_FEATURE_PREFIX.length)
    : featureName;

  const { operator, baseFeatureName } = parseComparisonPrefix(
    unprefixedFeatureName,
  );

  if (
    isWebkitPrefixed &&
    baseFeatureName !== WEBKIT_ALLOWED_BASE_FEATURE_NAME
  ) {
    return null;
  }

  const feature = MEDIA_QUERY_NUMERIC_FEATURES.get(baseFeatureName);

  if (!isDefined(feature)) {
    return null;
  }

  return { operator, feature };
};
