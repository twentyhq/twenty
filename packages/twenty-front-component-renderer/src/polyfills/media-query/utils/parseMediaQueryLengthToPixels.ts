import { isDefined } from 'twenty-shared/utils';

import { MEDIA_QUERY_LENGTH_UNIT_TO_PIXELS } from '@/polyfills/media-query/constants/MediaQueryLengthUnitToPixels';
import { parseMediaQueryNumericValueParts } from '@/polyfills/media-query/utils/parseMediaQueryNumericValueParts';

export const parseMediaQueryLengthToPixels = (
  lengthString: string,
): number | null => {
  const lengthParts = parseMediaQueryNumericValueParts(lengthString);

  if (!isDefined(lengthParts)) {
    return null;
  }

  const { numericValue, unit } = lengthParts;

  if (unit === '') {
    const isZeroLength = numericValue === 0;

    return isZeroLength ? 0 : null;
  }

  const pixelsPerUnit = MEDIA_QUERY_LENGTH_UNIT_TO_PIXELS[unit];

  if (!isDefined(pixelsPerUnit)) {
    return null;
  }

  return numericValue * pixelsPerUnit;
};
