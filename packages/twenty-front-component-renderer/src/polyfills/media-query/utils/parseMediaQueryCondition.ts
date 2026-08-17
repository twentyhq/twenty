import { isDefined } from 'twenty-shared/utils';

import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';
import { parseMediaQueryColorSchemeCondition } from '@/polyfills/media-query/utils/parseMediaQueryColorSchemeCondition';
import { parseMediaQueryComparisonPrefix } from '@/polyfills/media-query/utils/parseMediaQueryComparisonPrefix';
import { parseMediaQueryDevicePixelRatioCondition } from '@/polyfills/media-query/utils/parseMediaQueryDevicePixelRatioCondition';
import { parseMediaQueryDimensionCondition } from '@/polyfills/media-query/utils/parseMediaQueryDimensionCondition';
import { parseMediaQueryResolutionCondition } from '@/polyfills/media-query/utils/parseMediaQueryResolutionCondition';

const CONDITION_WRAPPING_PARENTHESES_PATTERN = /^\((.*)\)$/;

const WEBKIT_FEATURE_PREFIX = '-webkit-';

const WEBKIT_DEVICE_PIXEL_RATIO_FEATURES = new Set([
  '-webkit-device-pixel-ratio',
  '-webkit-min-device-pixel-ratio',
  '-webkit-max-device-pixel-ratio',
]);

export const parseMediaQueryCondition = (
  conditionString: string,
): ParsedMediaQueryCondition | null => {
  const conditionMatch = conditionString.match(
    CONDITION_WRAPPING_PARENTHESES_PATTERN,
  );

  if (!isDefined(conditionMatch)) {
    return null;
  }

  const [, conditionContent] = conditionMatch;
  const colonIndex = conditionContent.indexOf(':');
  const hasFeatureNameValueSeparator = colonIndex !== -1;

  if (!hasFeatureNameValueSeparator) {
    return null;
  }

  const featureName = conditionContent.slice(0, colonIndex).trim();
  const featureValue = conditionContent.slice(colonIndex + 1).trim();

  if (featureName === '' || featureValue === '') {
    return null;
  }

  if (featureName === 'prefers-color-scheme') {
    return parseMediaQueryColorSchemeCondition(featureValue);
  }

  const unprefixedFeatureName = WEBKIT_DEVICE_PIXEL_RATIO_FEATURES.has(
    featureName,
  )
    ? featureName.slice(WEBKIT_FEATURE_PREFIX.length)
    : featureName;

  const { comparison, baseFeatureName } = parseMediaQueryComparisonPrefix(
    unprefixedFeatureName,
  );

  if (baseFeatureName === 'width' || baseFeatureName === 'height') {
    return parseMediaQueryDimensionCondition({
      dimension: baseFeatureName,
      comparison,
      featureValue,
    });
  }

  if (baseFeatureName === 'device-pixel-ratio') {
    return parseMediaQueryDevicePixelRatioCondition({
      comparison,
      featureValue,
    });
  }

  if (baseFeatureName === 'resolution') {
    return parseMediaQueryResolutionCondition({ comparison, featureValue });
  }

  return null;
};
