import { isDefined } from 'twenty-shared/utils';

import { parseMediaQueryNumericValueParts } from '@/polyfills/media-query/utils/parseMediaQueryNumericValueParts';

export const parseMediaQueryDevicePixelRatioValue = (
  featureValue: string,
): number | null => {
  const valueParts = parseMediaQueryNumericValueParts(featureValue);

  if (!isDefined(valueParts) || valueParts.unit !== '') {
    return null;
  }

  return valueParts.numericValue;
};
