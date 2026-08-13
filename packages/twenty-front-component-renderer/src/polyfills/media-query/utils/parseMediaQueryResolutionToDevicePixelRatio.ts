import { isDefined } from 'twenty-shared/utils';

import { MEDIA_QUERY_RESOLUTION_UNIT_TO_DEVICE_PIXEL_RATIO } from '@/polyfills/media-query/constants/MediaQueryResolutionUnitToDevicePixelRatio';

export const parseMediaQueryResolutionToDevicePixelRatio = (
  resolutionString: string,
): number | null => {
  const resolutionMatch = resolutionString.match(/^(\d+(?:\.\d+)?)([a-z]+)$/);

  if (!isDefined(resolutionMatch)) {
    return null;
  }

  const numericValue = Number(resolutionMatch[1]);
  const unit = resolutionMatch[2];

  const devicePixelRatioPerUnit =
    MEDIA_QUERY_RESOLUTION_UNIT_TO_DEVICE_PIXEL_RATIO[unit];

  if (!isDefined(devicePixelRatioPerUnit)) {
    return null;
  }

  return numericValue * devicePixelRatioPerUnit;
};
