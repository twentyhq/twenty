import { isNumber } from '@sniptt/guards';

import { UNITLESS_CSS_PROPERTY_NAMES } from '@/constants/UnitlessCssPropertyNames';
import { isCssCustomPropertyName } from '@/utils/isCssCustomPropertyName';

export const formatStyleValueForCssStore = (
  value: unknown,
  camelCasePropertyName: string,
  shouldConvertNumbersToPixels: boolean,
): string => {
  const shouldAppendPixelUnitToNumber =
    shouldConvertNumbersToPixels &&
    isNumber(value) &&
    value !== 0 &&
    !isCssCustomPropertyName(camelCasePropertyName) &&
    !UNITLESS_CSS_PROPERTY_NAMES.has(camelCasePropertyName);

  return shouldAppendPixelUnitToNumber ? `${value}px` : String(value);
};
