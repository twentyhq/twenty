import { isDefined } from 'twenty-shared/utils';

import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';
import { parseMediaQueryColorSchemeCondition } from '@/polyfills/media-query/utils/parseMediaQueryColorSchemeCondition';
import { parseMediaQueryComparisonPrefix } from '@/polyfills/media-query/utils/parseMediaQueryComparisonPrefix';
import { parseMediaQueryDevicePixelRatioValue } from '@/polyfills/media-query/utils/parseMediaQueryDevicePixelRatioValue';
import { parseMediaQueryLengthToPixels } from '@/polyfills/media-query/utils/parseMediaQueryLengthToPixels';
import { parseMediaQueryResolutionToDevicePixelRatio } from '@/polyfills/media-query/utils/parseMediaQueryResolutionToDevicePixelRatio';

const CONDITION_WRAPPING_PARENTHESES_PATTERN = /^\((.*)\)$/;

const WEBKIT_FEATURE_PREFIX = '-webkit-';

const WEBKIT_ALLOWED_BASE_FEATURE_NAME = 'device-pixel-ratio';

type MediaQueryNumericFeature = {
  source: Extract<ParsedMediaQueryCondition, { kind: 'numeric' }>['source'];
  parseValue: (featureValue: string) => number | null;
};

const MEDIA_QUERY_NUMERIC_FEATURES: Record<
  string,
  MediaQueryNumericFeature | undefined
> = {
  width: { source: 'viewportWidth', parseValue: parseMediaQueryLengthToPixels },
  height: {
    source: 'viewportHeight',
    parseValue: parseMediaQueryLengthToPixels,
  },
  'device-pixel-ratio': {
    source: 'devicePixelRatio',
    parseValue: parseMediaQueryDevicePixelRatioValue,
  },
  resolution: {
    source: 'devicePixelRatio',
    parseValue: parseMediaQueryResolutionToDevicePixelRatio,
  },
};

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

  const numericFeature = MEDIA_QUERY_NUMERIC_FEATURES[baseFeatureName];

  if (!isDefined(numericFeature)) {
    return null;
  }

  const value = numericFeature.parseValue(featureValue);

  if (!isDefined(value)) {
    return null;
  }

  return { kind: 'numeric', source: numericFeature.source, comparison, value };
};
