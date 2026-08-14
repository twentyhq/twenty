import { isDefined } from 'twenty-shared/utils';

import { MEDIA_QUERY_LENGTH_UNIT_TO_PIXELS } from '@/polyfills/media-query/constants/MediaQueryLengthUnitToPixels';

export const parseMediaQueryLengthToPixels = (
  lengthString: string,
): number | null => {
  const lengthMatch = lengthString.match(/^(\d+(?:\.\d+)?|\.\d+)([a-z%]*)$/);

  if (!isDefined(lengthMatch)) {
    return null;
  }

  const numericValue = Number(lengthMatch[1]);
  const unit = lengthMatch[2];

  if (unit === '') {
    return numericValue === 0 ? 0 : null;
  }

  const pixelsPerUnit = MEDIA_QUERY_LENGTH_UNIT_TO_PIXELS[unit];

  if (!isDefined(pixelsPerUnit)) {
    return null;
  }

  return numericValue * pixelsPerUnit;
};
