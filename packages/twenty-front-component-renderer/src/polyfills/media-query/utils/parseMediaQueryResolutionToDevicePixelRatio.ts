import { isDefined } from 'twenty-shared/utils';

import { MEDIA_QUERY_RESOLUTION_UNIT_TO_DEVICE_PIXEL_RATIO } from '@/polyfills/media-query/constants/MediaQueryResolutionUnitToDevicePixelRatio';
import { parseMediaQueryNumericValueParts } from '@/polyfills/media-query/utils/parseMediaQueryNumericValueParts';

export const parseMediaQueryResolutionToDevicePixelRatio = (
  resolutionString: string,
): number | null => {
  const resolutionParts = parseMediaQueryNumericValueParts(resolutionString);

  if (!isDefined(resolutionParts)) {
    return null;
  }

  const devicePixelRatioPerUnit =
    MEDIA_QUERY_RESOLUTION_UNIT_TO_DEVICE_PIXEL_RATIO[resolutionParts.unit];

  if (!isDefined(devicePixelRatioPerUnit)) {
    return null;
  }

  return resolutionParts.numericValue * devicePixelRatioPerUnit;
};
