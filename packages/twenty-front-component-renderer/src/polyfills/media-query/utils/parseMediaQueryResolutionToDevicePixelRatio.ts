import { isDefined } from 'twenty-shared/utils';

import { MEDIA_QUERY_RESOLUTION_UNIT_TO_DEVICE_PIXEL_RATIO } from '@/polyfills/media-query/constants/MediaQueryResolutionUnitToDevicePixelRatio';

const MEDIA_QUERY_RESOLUTION_PATTERN = /^(\d+(?:\.\d+)?|\.\d+)([a-z]+)$/;

export const parseMediaQueryResolutionToDevicePixelRatio = (
  resolutionString: string,
): number | null => {
  const resolutionMatch = resolutionString.match(
    MEDIA_QUERY_RESOLUTION_PATTERN,
  );

  if (!isDefined(resolutionMatch)) {
    return null;
  }

  const [, numericValuePart, unit] = resolutionMatch;
  const numericValue = Number(numericValuePart);

  const devicePixelRatioPerUnit =
    MEDIA_QUERY_RESOLUTION_UNIT_TO_DEVICE_PIXEL_RATIO[unit];

  if (!isDefined(devicePixelRatioPerUnit)) {
    return null;
  }

  return numericValue * devicePixelRatioPerUnit;
};
