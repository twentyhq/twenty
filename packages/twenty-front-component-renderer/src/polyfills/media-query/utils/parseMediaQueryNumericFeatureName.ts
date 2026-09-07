import { isDefined } from 'twenty-shared/utils';

import { MEDIA_QUERY_NUMERIC_FEATURES } from '@/polyfills/media-query/constants/MediaQueryNumericFeatures';
import { type ParsedMediaQueryNumericFeatureName } from '@/polyfills/media-query/types/ParsedMediaQueryNumericFeatureName';
import { parseMediaQueryComparisonPrefix } from '@/polyfills/media-query/utils/parseMediaQueryComparisonPrefix';

const WEBKIT_FEATURE_PREFIX = '-webkit-';

const WEBKIT_ALLOWED_BASE_FEATURE_NAME = 'device-pixel-ratio';

export const parseMediaQueryNumericFeatureName = (
  featureName: string,
): ParsedMediaQueryNumericFeatureName | null => {
  const isWebkitPrefixed = featureName.startsWith(WEBKIT_FEATURE_PREFIX);
  const unprefixedFeatureName = isWebkitPrefixed
    ? featureName.slice(WEBKIT_FEATURE_PREFIX.length)
    : featureName;

  const { comparison, baseFeatureName } = parseMediaQueryComparisonPrefix(
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

  return { comparison, feature };
};
