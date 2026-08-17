import { isDefined } from 'twenty-shared/utils';

import { MEDIA_QUERY_LENGTH_UNIT_TO_PIXELS } from '@/polyfills/media-query/constants/MediaQueryLengthUnitToPixels';

const MEDIA_QUERY_LENGTH_PATTERN = /^(\d+(?:\.\d+)?|\.\d+)([a-z%]*)$/;

export const parseMediaQueryLengthToPixels = (
  lengthString: string,
): number | null => {
  const lengthMatch = lengthString.match(MEDIA_QUERY_LENGTH_PATTERN);

  if (!isDefined(lengthMatch)) {
    return null;
  }

  const [, numericValuePart, unit] = lengthMatch;
  const numericValue = Number(numericValuePart);
  const isUnitless = unit === '';

  if (isUnitless) {
    const isZeroLength = numericValue === 0;

    return isZeroLength ? 0 : null;
  }

  const pixelsPerUnit = MEDIA_QUERY_LENGTH_UNIT_TO_PIXELS[unit];

  if (!isDefined(pixelsPerUnit)) {
    return null;
  }

  return numericValue * pixelsPerUnit;
};
