import { isDefined } from 'twenty-shared/utils';

import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';
import { parseMediaQueryLengthToPixels } from '@/polyfills/media-query/utils/parseMediaQueryLengthToPixels';
import { parseMediaQueryResolutionToDevicePixelRatio } from '@/polyfills/media-query/utils/parseMediaQueryResolutionToDevicePixelRatio';

const WEBKIT_FEATURE_PREFIX = '-webkit-';

export const parseMediaQueryCondition = (
  conditionString: string,
): ParsedMediaQueryCondition | null => {
  const conditionMatch = conditionString.match(/^\((.*)\)$/);

  if (!isDefined(conditionMatch)) {
    return null;
  }

  const conditionContent = conditionMatch[1];
  const colonIndex = conditionContent.indexOf(':');

  if (colonIndex === -1) {
    return null;
  }

  const featureName = conditionContent.slice(0, colonIndex).trim();
  const featureValue = conditionContent.slice(colonIndex + 1).trim();

  if (featureName === '' || featureValue === '') {
    return null;
  }

  if (featureName === 'prefers-color-scheme') {
    if (
      featureValue === 'light' ||
      featureValue === 'dark' ||
      featureValue === 'no-preference'
    ) {
      return { kind: 'color-scheme', value: featureValue };
    }

    return null;
  }

  let remainingFeatureName = featureName.startsWith(WEBKIT_FEATURE_PREFIX)
    ? featureName.slice(WEBKIT_FEATURE_PREFIX.length)
    : featureName;

  let comparison: 'min' | 'max' | 'exact' = 'exact';

  if (remainingFeatureName.startsWith('min-')) {
    comparison = 'min';
    remainingFeatureName = remainingFeatureName.slice('min-'.length);
  } else if (remainingFeatureName.startsWith('max-')) {
    comparison = 'max';
    remainingFeatureName = remainingFeatureName.slice('max-'.length);
  }

  if (remainingFeatureName === 'width' || remainingFeatureName === 'height') {
    const valueInPixels = parseMediaQueryLengthToPixels(featureValue);

    if (!isDefined(valueInPixels)) {
      return null;
    }

    return {
      kind: 'numeric',
      source:
        remainingFeatureName === 'width' ? 'viewportWidth' : 'viewportHeight',
      comparison,
      value: valueInPixels,
    };
  }

  if (remainingFeatureName === 'device-pixel-ratio') {
    if (!/^\d+(\.\d+)?$/.test(featureValue)) {
      return null;
    }

    return {
      kind: 'numeric',
      source: 'devicePixelRatio',
      comparison,
      value: Number(featureValue),
    };
  }

  if (remainingFeatureName === 'resolution') {
    const valueInDevicePixelRatio =
      parseMediaQueryResolutionToDevicePixelRatio(featureValue);

    if (!isDefined(valueInDevicePixelRatio)) {
      return null;
    }

    return {
      kind: 'numeric',
      source: 'devicePixelRatio',
      comparison,
      value: valueInDevicePixelRatio,
    };
  }

  return null;
};
